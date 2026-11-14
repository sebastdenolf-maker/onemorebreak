-- Apply once to a dedicated Supabase project. All member data stays private.
begin;

create table public.omb_members (
  user_id uuid primary key references auth.users(id) on delete cascade,
  member_number bigint generated always as identity (start with 100000) unique not null,
  email text not null unique,
  display_name text not null default '' check (length(display_name) <= 80),
  joined_at timestamptz not null default now(),
  active boolean not null default true
);
alter table public.omb_members enable row level security;
revoke all on public.omb_members from anon, authenticated;
grant select on public.omb_members to authenticated;
create policy own_membership on public.omb_members for select to authenticated
  using ((select auth.uid()) = user_id);

-- Call only after email verification. Repeated requests return the same number.
create function public.omb_claim_membership(p_display_name text default '')
returns setof public.omb_members
language plpgsql security definer set search_path = '' as $$
declare
  verified_email text;
begin
  select lower(email) into verified_email from auth.users
    where id = auth.uid() and email_confirmed_at is not null;
  if verified_email is null then
    raise exception 'Confirm your email first' using errcode = '42501';
  end if;
  insert into public.omb_members(user_id, email, display_name)
    values (auth.uid(), verified_email, left(trim(coalesce(p_display_name, '')), 80))
    on conflict (user_id) do update set email = excluded.email;
  return query select * from public.omb_members where user_id = auth.uid();
end;
$$;
revoke all on function public.omb_claim_membership(text) from public, anon;
grant execute on function public.omb_claim_membership(text) to authenticated;

-- Real exclusive information is fetched from here, never embedded in HTML.
create table public.omb_member_posts (
  id bigint generated always as identity primary key,
  title text not null check (length(title) between 1 and 200),
  body text not null,
  published boolean not null default false,
  published_at timestamptz not null default now()
);
alter table public.omb_member_posts enable row level security;
revoke all on public.omb_member_posts from anon, authenticated;
grant select on public.omb_member_posts to authenticated;
create policy active_member_posts on public.omb_member_posts for select to authenticated
  using (published and exists (
    select 1 from public.omb_members where user_id = (select auth.uid()) and active
  ));

-- A real database query for the scheduled availability check; exposes no emails.
create table public.omb_health (
  id integer primary key check (id = 1),
  status text not null
);
insert into public.omb_health values (1, 'ok');
alter table public.omb_health enable row level security;
revoke all on public.omb_health from anon, authenticated;
grant select on public.omb_health to anon, authenticated;
create policy health_read on public.omb_health for select to anon, authenticated using (true);

commit;
