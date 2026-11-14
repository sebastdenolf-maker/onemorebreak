# ONEMOREBREAK membership

Integration connected to the BLACKSTAR Supabase project (enyomwgfefynohudmjdt). Schema applied on 2026-11-14. Public website deployment and real email delivery still pending.

## Connect the project

1. Create a dedicated Supabase project and keep email confirmation enabled.
2. `supabase/membership.sql` has already been applied to this project. Do not run it again. For a new project, apply it once. Members are created only after verification, with a stable database-generated number. Repeated sign-ins reuse that number.
3. Copy the project URL and **publishable/anon** key into `membership-config.js`. Never use a secret/service-role key in the browser or health workflow.
4. Set the production Site URL and explicitly allow the production page with `?membership=confirmed` under Auth → URL Configuration. Use the real deployed URL, not a guessed domain. Configure localhost separately for testing.
5. Configure custom SMTP before accepting public registrations. Supabase's built-in email service is restricted and not suitable for arbitrary visitor addresses. Test delivery and sender authentication. Keep the standard magic-link email template or an equivalent template using `{{ .ConfirmationURL }}`.
6. Publish the modified HTML and three membership assets together through the site's existing hosting setup. GitHub is currently a private source repository, with GitHub Pages disabled; identify its actual host before deployment.

## Owner overview and exclusive information

- Supabase Table Editor → `omb_members`: verified email, member number, optional name, registration time and active status. Export from this owner-only dashboard.
- Table Editor → `omb_member_posts`: add a title and plain-text body, then set `published = true`. No dummy exclusive content has been seeded.
- Visitors can read only their own membership row. Only verified, active members can fetch published posts. No browser role can insert or edit member records directly, read other members, or publish posts.
- Setting `active = false` blocks protected post access. Existing games remain browser-side entertainment and are not a secure paywall; actual confidential updates must stay in `omb_member_posts` or private storage.
- Membership does not expire. A browser session can expire or be cleared; using the same verified email restores the existing number on any device. No password is required.
- Auth email storage is required for access only; marketing subscriptions are not collected or implied.

## Scheduled availability check

The workflow includes only the browser-safe project URL and publishable key, matching the website configuration. No secret or admin key is required. Enable the workflow on the default branch and run it manually once. It queries only a fixed public health row twice daily, without reading emails or exposing an admin key.

This creates database activity and checks availability. It does not guarantee exemption from free-plan pausing, unpause a paused project, or guarantee availability when GitHub schedules are delayed/disabled. Enable GitHub Actions failure notifications for the repository owner. No separate Codex reminder is needed; this is part of the website's infrastructure.

## Required live checks before launch

- Send and receive a real access link via configured SMTP; confirm first registration creates exactly one member row and no member exists before verification.
- Open the link, confirm the returned member number, then revisit and use another device with the same email: number must remain unchanged.
- Anonymous requests must not expose members or posts. An authenticated user must not see another user's row or insert/edit membership or posts.
- Confirm a real published post loads for members and is rejected for an inactive member.
- Sign out; cached content is cleared. Refresh must remain signed out.
- Run the GitHub workflow and inspect success/failure output with no credentials or member data in logs.

Live permission, email and hosting checks remain required. The schema exists, but a successful end-to-end registration has not yet been verified.
