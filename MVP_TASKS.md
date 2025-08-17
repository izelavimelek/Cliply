## MVP Step-by-Step Task Plan

Aligned to `requirements.md` for the Clipping Marketplace MVP.

### General
- **Tracking board**: Columns Backlog → In Progress → Review → Done; labels `frontend`, `backend`, `edge-fn`, `db`, `infra`, `payments`, `auth`, `admin`, `testing`.
- **Envs**: Document `.env.local`/Vercel envs for Supabase, Stripe, YouTube, Sentry.

### 1) Project & Infra Setup
- **Vercel**: Connect repo; Next.js App Router default settings; `VERCEL_ANALYTICS=1`.
- **Supabase**: Create project; capture `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SERVICE_ROLE_KEY`; init Supabase CLI.
- **Stripe**: Enable test mode; create Connect (Standard/Express); obtain keys.
- **Sentry**: Create project; DSN for browser/server.
**Acceptance**: One-click deploy works; `.env.local` template committed.

### 2) Database Schema + RLS (Supabase)
- **DDL**: Tables `profiles`, `brands`, `campaigns`, `submissions`, `snapshots`, `payouts`, `webhooks`, `audit_logs`.
- **Constraints/Indexes**: Unique `campaigns.caption_code`; unique `(campaign_id, platform_media_id)`; index `snapshots (submission_id, fetched_at)`.
- **RLS**: Role-based policies (Creator/Brand/Admin via `profiles.is_admin`).
- **Seeds**: Minimal dev data.
**Acceptance**: Migrations apply cleanly; RLS tests pass for role isolation.

### 3) Auth & Onboarding (Supabase Auth)
- **Client**: Supabase client; Email + Google providers.
- **Webhook**: `POST /api/auth/webhook` → create `profiles` row on signup.
- **Onboarding**: `/onboarding` role select; role-specific profile forms; optional `brands` row for brand users.
**Acceptance**: New users sign up → choose role → complete profile → redirected to dashboard.

### 4) App Shell & UI (shadcn/ui + Tailwind)
- **Shell**: Sidebar/topbar; role-aware nav; breadcrumb; light/dark theme.
- **Components**: Button, Input, Select, Dialog, Dropdown, Tabs, Tooltip, Sonner toast, Table, Badge, Card, Skeleton.
- **Routing**: `/`, `/creator/*`, `/brand/*`, `/admin/*` route groups.
**Acceptance**: Responsive, accessible shell with consistent theming.

### 5) Campaigns (Brand)
- **API**: `POST /api/campaigns`, `GET /api/campaigns`, `GET /api/campaigns/:id`, `PATCH /api/campaigns/:id` (zod validation; brand ownership enforced).
- **Caption code**: Unique code generated on create.
- **UI**: `/brand/campaigns` list+filters; `/brand/campaigns/new` form; `/brand/campaigns/[id]` detail with budget bar & status.
- **Watermark pack (MVP)**: Generate downloadable PNG overlays with caption code; store in Supabase Storage.
**Acceptance**: Brands can create/edit/pause; caption code visible and unique.

### 6) Discovery (Creator)
- **API**: `GET /api/campaigns` supports filters (platform, min payout, budget left).
- **UI**: `/creator/campaigns` grid; `/creator/campaigns/[id]` details with rules and payout math.
**Acceptance**: Creators browse and open details; access constrained by RLS.

### 7) Submission Flow
- **API**: `POST /api/submissions` {campaignId, postUrl}; `GET /api/submissions?mine=1`; `GET /api/submissions/:id`.
- **Upload**: Signed URL upload to `submissions/` bucket for optional MP4.
- **UI**: `/creator/submit/[campaignId]` form; My Submissions list with status.
- **Edge Function `verify-post`**: Parse URL; for YouTube check caption code via public API/scrape; store preview; create acceptance snapshot if approved; set `caption_code_found`.
- **Server route**: `POST /api/submissions/:id/verify` invokes edge function.
**Acceptance**: Submissions created and verified; first snapshot captured on approval.

### 8) Tracking (YouTube MVP)
- **Edge Function `poll-views`**: Poll `viewCount` for approved submissions; append `snapshots`.
- **Cron**: Vercel Cron schedule — every 30–60 min first 48h, then daily.
- **UI**: Mini time-series chart on submission detail (Recharts).
**Acceptance**: Snapshots accumulate and render in chart; cron observable in logs.

### 9) Payout Calculation (Manual trigger)
- **Edge Function `compute-payouts`**: Compute `views_delta × rate/1000` capped by budgets/caps; write `payouts` with `details_json`.
- **Admin queue**: `/admin/payouts` list pending/ready/paid; manual recompute; mark paid.
**Acceptance**: Deterministic payouts created with transparent math trail.

### 10) Payments (Stripe Connect)
- **Creators**: Connect onboarding link + status; persist `profiles.stripe_connect_id`.
- **Admin (manual)**: Operational runbook to batch pay in Stripe dashboard; UI to mark payouts paid.
- **Webhooks**: `POST /api/webhooks/stripe` with signature verification; update statuses.
**Acceptance**: Creators onboard; admin reconciles manual payouts; webhooks recorded.

### 11) Admin Dashboard
- **Queues**: Submissions review (approve/reject with notes, basic flags); Payouts queue.
- **Controls**: Edit/lock campaign; pause/resume.
**Acceptance**: Admin manages flows without DB access.

### 12) Security, Validation, Rate Limiting
- **Validation**: zod on APIs/forms; URL sanitization.
- **Rate limiting**: Simple per-IP middleware for sensitive routes.
- **Audit logs**: Append-only for admin actions with actor + metadata.
- **Secrets**: Vercel env + Supabase secrets; no client leakage.
**Acceptance**: Negative tests confirm blocked access; inputs validated.

### 13) Observability & Legal
- **Sentry**: Client/server + edge function instrumentation.
- **Analytics**: Vercel Analytics enabled.
- **Legal**: Terms, Privacy, Cookie Policy, Fees pages.
**Acceptance**: Errors visible in Sentry; legal pages live.

### 14) Testing
- **Unit**: Payout math; URL parsers; verification helpers.
- **Integration**: Submission → verify → snapshot → payout.
- **E2E (Playwright)**: Creator signup/onboarding/submit; Brand create campaign; Admin approve; compute payouts.
- **RLS tests**: Cross-tenant access attempts are denied.
**Acceptance**: Green CI; critical E2E pass.

### 15) Deployment & Runbook
- **Promotion**: Staging → Production; seed minimal data.
- **Runbook**: Cron schedules, manual payout flow, incidents, env rotation.
**Acceptance**: Production deploy succeeds; runbook committed.

### Environment Variables (baseline)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server only)
- `YOUTUBE_API_KEY` (server)
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `SENTRY_DSN`
- `VERCEL_ANALYTICS`
- `VERCEL_CRON_SECRET` (if used)

### Suggested PR Sequencing
1. Infra + DB migrations + RLS
2. Auth + Onboarding
3. App shell + UI kit
4. Campaigns (Brand)
5. Discovery (Creator)
6. Submissions + Storage + `verify-post`
7. Polling + snapshots + chart
8. Payout compute + admin payouts queue
9. Stripe Connect + webhooks + reconciliation
10. Security + Observability + Legal
11. Test suite + CI + Deployment


