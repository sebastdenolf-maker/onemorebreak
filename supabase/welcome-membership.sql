-- Apply once before publishing the welcome-mail browser integration.
begin;
create table public.omb_welcome_emails (
  user_id uuid primary key references public.omb_members(user_id) on delete cascade,
  recipient text not null,
  member_number bigint not null,
  first_attempt_at timestamptz,
  locked_until timestamptz,
  attempts integer not null default 0,
  sent_at timestamptz,
  provider_id text,
  created_at timestamptz not null default now()
);
alter table public.omb_welcome_emails enable row level security;
revoke all on public.omb_welcome_emails from public, anon, authenticated;
grant select, update on public.omb_welcome_emails to service_role;

create function public.omb_queue_welcome_email() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.omb_welcome_emails(user_id,recipient,member_number)
    values(new.user_id,new.email,new.member_number) on conflict do nothing;
  return new;
end;
$$;
revoke all on function public.omb_queue_welcome_email() from public,anon,authenticated;
create trigger omb_member_welcome after insert on public.omb_members
for each row execute function public.omb_queue_welcome_email();

-- Atomic claim prevents concurrent requests sending twice. Stop retries before
-- Resend's 24-hour idempotency window expires; uncertain older sends need review.
create function public.omb_take_welcome_email(p_user_id uuid)
returns setof public.omb_welcome_emails
language sql security definer set search_path = '' as $$
  update public.omb_welcome_emails w
  set first_attempt_at=coalesce(w.first_attempt_at,now()),
      locked_until=now()+interval '2 minutes', attempts=w.attempts+1
  where w.user_id=p_user_id and w.sent_at is null
    and (w.locked_until is null or w.locked_until<now())
    and (w.first_attempt_at is null or w.first_attempt_at>now()-interval '23 hours')
    and exists(select 1 from public.omb_members m where m.user_id=w.user_id and m.active)
  returning w.*;
$$;
revoke all on function public.omb_take_welcome_email(uuid) from public,anon,authenticated;
grant execute on function public.omb_take_welcome_email(uuid) to service_role;
-- Existing members are deliberately not queued; no unsolicited backfill.
commit;
