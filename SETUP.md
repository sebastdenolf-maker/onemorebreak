# ONEMOREBREAK membership

Live at https://onemorebreak.com. Connected to BLACKSTAR Supabase project enyomwgfefynohudmjdt. Schema, sender verification, SMTP and HTTPS configured on 2026-11-14. Registration enabled after a real delivered email and successful member-access test. Test member: 100000.

## Connect the project

1. Create a dedicated Supabase project and keep email confirmation enabled.
2. `supabase/membership.sql` has already been applied to this project. Do not run it again. For a new project, apply it once. Members are created only after verification, with a stable database-generated number. Repeated sign-ins reuse that number.
3. Copy the project URL and **publishable/anon** key into `membership-config.js`. Never use a secret/service-role key in the browser or health workflow.
4. Set the production Site URL and explicitly allow the production page with `?membership=confirmed` under Auth → URL Configuration. Use the real deployed URL, not a guessed domain. Configure localhost separately for testing.
5. Configure custom SMTP before accepting public registrations. Supabase's built-in email service is restricted and not suitable for arbitrary visitor addresses. Test delivery and sender authentication. Keep the standard email-code template from `supabase/email-template.html`, using `{{ .Token }}`. Apply it to both Confirm sign up and Magic link or OTP.
6. The repository is public and hosted on GitHub Pages. The custom domain is onemorebreak.com, with HTTPS enforced. Publish HTML and membership assets together; bump their query versions when changing the assets to avoid stale cached registration settings.

## Owner overview and exclusive information

- Supabase Table Editor → `omb_members`: verified email, member number, optional name, registration time and active status. Export from this owner-only dashboard.
- Table Editor → `omb_member_posts`: add a title and plain-text body, then set `published = true`. No dummy exclusive content has been seeded.
- Visitors can read only their own membership row. Only verified, active members can fetch published posts. No browser role can insert or edit member records directly, read other members, or publish posts.
- Setting `active = false` blocks protected post access. Existing games remain browser-side entertainment and are not a secure paywall; actual confidential updates must stay in `omb_member_posts` or private storage.
- Membership does not expire. A browser session can expire or be cleared; using the same verified email restores the existing number on any device. No password is required.
- Auth email storage is required for access only; marketing subscriptions are not collected or implied.

## Scheduled availability check

The workflow is active on main and passed its manual test. It includes only the browser-safe project URL and publishable key, matching the website configuration. No secret or admin key is required. It queries only a fixed public health row twice daily, without reading emails or exposing an admin key.

This creates database activity and checks availability. It does not guarantee exemption from free-plan pausing, unpause a paused project, or guarantee availability when GitHub schedules are delayed/disabled. Enable GitHub Actions failure notifications for the repository owner. No separate Codex reminder is needed; this is part of the website's infrastructure.

## Verification checklist

- Send and receive a real access code via configured SMTP; confirm first registration creates exactly one member row and no member exists before verification.
- Enter the code, confirm the returned member number, then revisit and use another device with the same email: number must remain unchanged.
- Anonymous requests must not expose members or posts. An authenticated user must not see another user's row or insert/edit membership or posts.
- Confirm a real published post loads for members and is rejected for an inactive member.
- Sign out; cached content is cleared. Refresh must remain signed out.
- Run the GitHub workflow and inspect success/failure output with no credentials or member data in logs.

Completed: anonymous access denial, unverified claim denial, real Gmail inbox delivery, custom-domain callback, database member row, and stable number after reload. Supabase keeps email addresses out of public HTML. The first member is Sebast (#100000); this is the owner’s real email, retained as a working membership.

## Production mail and DNS

Sender: ONEMOREBREAK <members@onemorebreak.com>, using Resend SMTP (smtp.resend.com, port 465, username resend). The existing Resend API credential is stored encrypted in Supabase, never in this repository. Resend domain is verified in the Ireland region. Click/open tracking remains off.

Porkbun: root ALIAS and www CNAME point to sebastdenolf-maker.github.io. Resend DKIM, rsend and send CNAMEs and a monitoring DMARC record have been added. Existing inbound mail-forwarding records were preserved.

Supabase Site URL: https://onemorebreak.com/. Exact membership callback URLs allow /?membership=confirmed and /index.html?membership=confirmed. Prior GitHub Pages callback remains allowed during migration.

## Email-code verification

Registration now uses email OTP rather than single-use URL links, avoiding link-prefetch consumption. Both Supabase mail templates display `{{ .Token }}`. The browser verifies the entered code with `verifyOtp({email, token, type: "email"})`; the database still assigns membership only after verification. A code is never stored in source or logs.
