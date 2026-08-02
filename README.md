# cirkle 28/07 saket discussion

Project: Cirkle.world (mobile-first community networking web app)

Outcome:
Build a functioning, production-lean MVP similar to LinkedIn but scoped to a single community. Core modules: Open Forum (with optional anonymous posting), member networking (search + connect), community jobs board, and events calendar. Must be mobile-first with a bottom tab bar.

Tech stack requirements:
- Frontend: React + TypeScript
- Styling/UI: Tailwind + shadcn/ui components (mobile-first, accessible)
- Backend: Supabase (Auth, Postgres, Row Level Security)
- No paid integrations; keep it simple and fully working end-to-end.

Global UX/UI:
- Mobile-first layout. Bottom navigation with 5 tabs:
  1) Forum
  2) Home
  3) Calendar
  4) My Network
  5) Jobs
- Clean, modern card-based UI, large tap targets, sticky bottom nav, safe-area padding.
- Use skeleton loaders for lists, empty states, and clear error toasts.

Auth + access:
- Allow anyone to view Landing page and read public parts (optional).
- Require login for: posting, commenting, connecting, applying for jobs, RSVPing.
- Supabase Auth (email/password). Add Google later only if easy.
- Roles: user, moderator, admin (store in profiles.role).
- Community scope: MVP supports one community_id (string), but design schema to support multiple communities later.

ROUTES / PAGES (must implement):
1) / (Landing)
   - App pitch + CTA: “Join community”
   - Login / Signup links

2) /forum (Tab: Forum)
   - List of posts (newest first), filter: “All” and “Anonymous only”
   - Composer:
     - Textarea “What do you want to share?”
     - Checkbox “Post as Anonymous”
     - Post button
   - Post card shows:
     - Author display name OR “Anonymous”
     - Timestamp
     - Content
     - Actions: Like, Comment, Share (share can be a simple copy link)
     - Report button
   - Comments (basic threaded not required; flat list ok)
   - IMPORTANT: If is_anonymous=true, UI must never reveal author profile.
   - Moderation: moderators/admin can delete any post/comment; users can delete their own.

3) /home (Tab: Home)
   - Personalized feed mixing:
     - Recent forum posts
     - Upcoming events
     - New jobs
   - Simple “For you” ordering: newest + items related to skills (optional; can be v1)

4) /calendar (Tab: Calendar)
   - Month view OR agenda list (mobile friendly)
   - Events list with RSVP toggle: Going / Not going
   - Create event (admin/moderator only):
     - title, description, start/end datetime, location (text), visibility (community)
   - Event detail page or drawer

5) /network (Tab: My Network)
   - Search members by name/skill/location
   - Member profile preview cards + “Connect” button
   - Connection requests:
     - Pending received: Accept / Decline
     - Pending sent: Cancel
   - Connections list

6) /jobs (Tab: Jobs)
   - Jobs list with filters: location (Delhi/Remote/etc), job type, experience (text ok)
   - Job detail page with Apply flow
   - Post a job (admin/moderator by default; later allow verified employers)
   - Apply: store application record + optional cover note + link to resume (URL)

7) /profile
   - View/edit own profile: name, headline, bio, location, skills tags
   - View other member profiles with Connect/Message placeholder (messaging can be v2)

DATABASE (Supabase tables to create):
- profiles: user_id (pk, references auth.users), name, headline, bio, location, skills (text[]), avatar_url, role (user/moderator/admin), community_id, created_at
- posts: id uuid pk, community_id, author_id (fk), is_anonymous boolean, content text, created_at
- comments: id uuid pk, post_id fk, author_id fk, content, created_at
- reactions: id uuid pk, entity_type (post/comment), entity_id, user_id, created_at (unique on entity + user)
- reports: id uuid pk, entity_type, entity_id, reporter_id, reason, created_at
- connections: id uuid pk, community_id, requester_id, receiver_id, status (pending/accepted/declined), created_at (unique pair)
- jobs: id uuid pk, community_id, created_by, title, company, location, job_type, experience, description, created_at
- applications: id uuid pk, job_id fk, applicant_id fk, note, resume_url, created_at (unique job + applicant)
- events: id uuid pk, community_id, created_by, title, description, start_time, end_time, location, created_at
- rsvps: id uuid pk, event_id fk, user_id fk, status (going/not_going), created_at (unique event + user)

SECURITY (RLS requirements):
- profiles: users can read profiles in same community; user can update only their own profile; admins/moderators can read all and manage roles.
- posts/comments: anyone logged-in in community can read; only author can edit/delete their own; moderators/admin can delete any.
- Anonymous handling:
  - posts.author_id is always stored.
  - UI must hide identity when is_anonymous=true.
  - Only moderators/admin can see author in moderation screens (create a simple /admin/moderation page).

IMPLEMENTATION ORDER:
- First generate UI pages + routing + components (mobile-first).
- Then connect Supabase Auth + database + RLS.
- Then wire CRUD for posts/comments, connections, jobs, events.
- Add moderation + reporting last.

Acceptance tests (must pass):
- A logged-in user can create a named post and it shows their name.
- A logged-in user can create an anonymous post and it shows “Anonymous” everywhere in UI.
- A moderator can delete reported posts and (in moderation view) see the real author_id.
- A user can search members and send a connection request; receiver can accept.
- A user can view jobs and apply once; application record is created.

Build this as a working MVP with clean code structure and reusable components.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/4aa20e4c-2108-4b7e-b1ab-8dfd1676969c).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm ci
npm run dev
```

Node.js 20.19 or newer is required. Copy `.env.example` to `.env` and fill in
the public Supabase values before starting the app.

## Production deployment

Before deploying a fresh Supabase project:

1. Link the Supabase CLI to the project and run all migrations.
2. Deploy the Edge Functions in `supabase/functions`.
3. Configure Supabase Phone Auth and Google OAuth, including the production
   site URL and redirect URLs. Set the phone OTP length to 6 and expiry to
   600 seconds.
4. Copy the server-only values listed in `supabase/.env.example` into Supabase
   Edge Function secrets. Add `GIPHY_API_KEY` if GIF search is enabled.
5. Create the first admin role through a trusted SQL/admin workflow. The web
   client intentionally cannot promote a user to admin.

### SMS OTP: Fast2SMS

Phone login remains a Supabase Auth OTP flow, so Supabase validates the code
and creates the user session. Its Send SMS HTTP Hook calls Fast2SMS using the
approved OTP template `9318bdac9f` (sender `DKCMPS`, entity
`1701170910413783014`). The template is tied to the Fast2SMS account, so the
hook only needs the OTP template ID and API key.

1. Deploy `send-sms-hook` with JWT verification disabled (already declared in
   `supabase/config.toml`).
2. In Supabase Dashboard, open **Authentication → Hooks → Send SMS** and choose
   an HTTP hook.
3. Use
   `https://huiyemdoomihtyivuwsd.supabase.co/functions/v1/send-sms-hook` as the
   hook URL.
4. Generate a Standard Webhooks secret in the form
   `v1,whsec_<base64-secret>`. Configure the same value in the Auth Hook and as
   the Edge Function secret `SEND_SMS_HOOK_SECRET`.
5. Set `FAST2SMS_API_KEY` and `FAST2SMS_OTP_ID=9318bdac9f` as Edge Function
   secrets. Never add either value to a `VITE_*` variable.

Fast2SMS accepts a 10-digit Indian mobile number for this endpoint, so the UI
intentionally supports `+91` numbers for phone OTP login.

### IIT email OTP: Amazon SES direct API

Private, transactional OTP email uses Amazon SES `SendEmail`. Amazon SNS email
is topic-based: recipients must first confirm a subscription, and publishing
would fan the same message out to topic subscribers. That is not safe or
appropriate for a private OTP sent to an arbitrary IIT address.

1. In Amazon SES, verify the sender email/domain in the same region configured
   by `AWS_REGION` and request production access if the account is still in the
   SES sandbox.
2. Create an IAM principal limited to `ses:SendEmail` for the verified SES
   identity, then set `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`,
   `AWS_REGION`, and `AWS_SES_FROM_EMAIL` as Supabase secrets.
3. Set a long random `VERIFICATION_CODE_SECRET`. It hashes stored email OTPs
   and must remain stable across function deployments.

For local or isolated staging testing only, set `EMAIL_OTP_TEST_MODE=true`.
The normal email OTP screen will open without sending an email and will accept
`123456`. Never enable this flag in production.

Typical deployment commands:

```sh
supabase login
supabase link --project-ref huiyemdoomihtyivuwsd
supabase db push
supabase secrets set --env-file supabase/.env.local
supabase functions deploy send-sms-hook --no-verify-jwt
supabase functions deploy send-verification-email
supabase functions deploy verify-iit-email
```

Cloudflare Pages settings:

```text
Build command: npm run build
Build output directory: dist
Node version: 20.19 or newer

VITE_SUPABASE_PROJECT_ID=<project id>
VITE_SUPABASE_URL=https://<project id>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<publishable key>
```

Never expose a Supabase secret/service-role key through a `VITE_*` variable.
Cloudflare SPA routing and baseline security headers are provided by
`public/_redirects` and `public/_headers`.
