# Clipping Marketplace SaaS – PRD + Tech Spec (MVP → V1.5 → V2.0)

> Goal: Launch a web app that lets **brands** create clipping campaigns and pay **creators** per view on short‑form platforms, with verifiable posting and automated tracking/payouts over time.

---

## 0) Scope at a Glance

* **Frontend:** Next.js (App Router), React, Tailwind CSS, shadcn/ui
* **Backend:** Supabase (Postgres + Auth + RLS + Storage + Edge Functions)
* **Payments:** Stripe Connect (Standard/Express accounts) for marketplace payouts
* **Media Storage:** Supabase Storage (MVP), optional S3 migration later
* **Scheduling/Jobs:** Vercel Cron + Supabase Edge Functions/Background Jobs
* **Analytics/Logs:** Vercel Analytics + Sentry (error tracking)
* **Auth Providers:** Email/password, Google, Apple (via Supabase Auth)
* **External APIs (tracking):** YouTube Data API (public view counts MVP), IG Graph API & TikTok for Business (post‑MVP)

---

## 1) User Roles & Permissions

* **Creator**: browse campaigns, submit posts, connect social accounts, view earnings, withdraw
* **Brand**: create/manage campaigns, review submissions, see spend, fund budgets
* **Admin**: moderation, dispute handling, manual payouts, rate limits, user safeguarding

### Access Control (RLS Summary)

* Creators can **only** read/write their own data.
* Brands can **only** read/write their campaigns, submissions tied to their campaigns.
* Admins can bypass scope via `is_admin` flag and dedicated RLS policies.

---

## 2) Product Phases

### Phase 1 — **MVP (4–6 weeks)**

**Objective:** Prove value with minimal friction. YouTube view tracking, manual payouts, strong proof‑of‑post.

**Key Features:**

1. **Auth & Onboarding** (Supabase): choose role (Creator/Brand), complete profile
2. **Campaigns (Brand):** create campaign (title, description, platform, payout \$/1k views, total budget, dates, rules), auto‑generate campaign **code** and **watermark pack**
3. **Discovery (Creator):** browse & filter campaigns; campaign detail
4. **Submission:** submit post (public URL + uploaded MP4 optional), **caption marker required** (e.g., `#MX-4832`); optional watermark embed via simple web editor (FFmpeg serverless task deferred; supply downloadable overlay in MVP)
5. **Verification:** validate caption code exists (server-side scraper or oEmbed/yt API), store preview, capture first snapshot
6. **Tracking (YouTube only):** poll public view counts by media ID; time‑series snapshots; cutoff snapshot
7. **Payout Calc (Manual trigger):** compute owed amount (`views delta × rate/1000`) -> move to **Ready to Pay** queue
8. **Payments (Stripe):** Stripe Connect onboarding for creators; **admin manual batch pay** (via Stripe dashboard) in MVP; ledger shown to users
9. **Admin Dashboard:** review queue (submissions, fraud flags), campaign controls, payouts queue
10. **Security:** RLS, webhook signatures, input validation, rate limiting, audit trails

**Non‑Goals:** IG/TikTok APIs, instant payouts, advanced anti‑fraud, AI clip recommendation

---

### Phase 2 — **V1.5 (6–10 weeks)**

**Objective:** Reduce manual work, broaden platforms, tighten fraud controls.

**Additions:**

* **Instagram Reels** via Graph API for **connected Business/Creator accounts** (OAuth, long‑lived tokens)
* **TikTok for Business** beta (connected accounts only)
* **Ownership Verification:** require OAuth connection for higher payout tiers; verify poster handle == connected account
* **Automated Payouts:** server‑initiated Stripe transfers on schedule; fee surfaces to brands
* **Quality Controls:** velocity anomaly flags, dedupe across campaigns, deletion/privatization handling
* **Basic Disputes:** creators/brands open disputes; admin workflow

---

### Phase 3 — **V2.0 (10–16+ weeks)**

**Objective:** Scale, insights, and reliability for enterprise brands.

**Additions:**

* **Escrow‑like budget holds** per campaign, automatic drawdown
* **Advanced Analytics:** per‑platform insights (reach, retention where available), cohort analysis, leaderboards
* **Recommendations:** rank campaigns for creators based on historical performance
* **Watermark Automation:** serverless FFmpeg pipeline to auto‑apply visual markers at export
* **Service Limits:** org accounts (multi‑user brand teams), roles/permissions, audit logs, SOC‑friendly settings
* **Chargeback & Refund Flows:** partial refunds on invalidated posts

---

## 3) Information Architecture & Screens

### Public

* **Landing**: value prop, how it works (Brands vs Creators), pricing, trust signals
* **Campaign Directory (optional public)**: SEO; limited detail until login
* **Legal**: Terms, Privacy, Cookie Policy, Fees

### Auth & Onboarding

* **Sign In/Up**: email, Google, Apple
* **Role Select**: Creator / Brand
* **Profile Setup**

  * Creator: handle, country, payout info (Stripe Connect flow), social links
  * Brand: company info, funding method, billing contact, VAT fields

### Creator App

* **Home (Discover)**: cards with payout rate, budget left, deadline, platform
* **Campaign Detail**: rules, required caption code, example posts, payout math, budget bar
* **Submit Post**: URL, optional file, claimed code, preview, confirm
* **Connect Accounts**: YouTube (optional), Instagram Business/Creator, TikTok Business
* **Earnings & Payouts**: ledger, pending/approved/paid, connect payout account status
* **My Submissions**: status list (Pending Review, Approved, Rejected), snapshots chart
* **Notifications**: submission decisions, payout processed, campaign changes

### Brand App

* **Dashboard**: spend, active campaigns, top creators/posts, budget alerts
* **Create/Edit Campaign**: form + code/watermark pack generator
* **Submissions Review**: approve/reject with notes; view proofs and snapshots
* **Budget & Billing**: top‑ups, invoices, card management, credits
* **Analytics**: views purchased vs budget, eCPC/eCPV, posts by performance

### Admin

* **Overview**: metrics, queue sizes, system health
* **Submissions Queue**: flags (no caption code, suspicious spikes, duplicates)
* **Campaigns**: edit/lock, pause, refund
* **Users**: KYC status, bans, role flags
* **Payouts**: compute, batch, reconcile
* **Audit Log**: all sensitive ops

### UI/UX & Components (shadcn/ui + Tailwind)

* **Navigation**: AppShell (sidebar for app areas), topbar with role switch (if user has both roles)
* **Cards**: CampaignCard (rate/budget/chips), SubmissionCard, PayoutCard
* **Forms**: zod + react‑hook‑form; inline validation; skeleton states
* **Tables**: DataTable w/ sorting, filtering, pagination
* **Charts**: Recharts for view/time series; simple area/line
* **Feedback**: toasts, empty states, error boundaries, loading skeletons
* **Modals/Drawers**: submission details, approve/reject w/ notes
* **Badges/Chips**: platform, status, risk level

---

## 4) Data Model (Supabase Postgres)

> Prefix with `public.`; RLS enforced on all except lookup tables.

**users** (extends Supabase `auth.users` via `profiles`)

* id (uuid, pk) — from auth
* role (enum: creator|brand|admin)
* handle (text, unique nullable)
* country (text)
* is\_admin (bool, default false)
* created\_at, updated\_at

**profiles**

* user\_id (uuid, pk, fk -> auth.users)
* display\_name (text)
* avatar\_url (text)
* stripe\_connect\_id (text)
* kyc\_status (enum: none|pending|verified|rejected)
* tfa\_enabled (bool)
* created\_at, updated\_at

**brands**

* id (uuid, pk)
* user\_id (uuid, unique, fk -> users)
* company\_name (text)
* tax\_id (text)
* billing\_email (text)
* created\_at, updated\_at

**campaigns**

* id (uuid, pk)
* brand\_id (uuid, fk -> brands)
* title (text)
* description (text)
* platform (enum: youtube|instagram|tiktok|any)
* payout\_per\_k\_views\_cents (int)
* total\_budget\_cents (int)
* budget\_remaining\_cents (int)
* creator\_cap\_cents (int, nullable)
* start\_at (timestamptz)
* end\_at (timestamptz)
* caption\_code (text, unique)
* status (enum: draft|active|paused|completed)
* created\_at, updated\_at

**submissions**

* id (uuid, pk)
* campaign\_id (uuid, fk -> campaigns)
* creator\_id (uuid, fk -> users)
* platform (enum)
* post\_url (text)
* platform\_media\_id (text)
* poster\_handle (text)
* caption\_code\_found (bool)
* ownership\_verified (bool)
* status (enum: pending|approved|rejected)
* reject\_reason (text)
* created\_at, updated\_at

**snapshots**

* id (bigint, pk)
* submission\_id (uuid, fk -> submissions)
* fetched\_at (timestamptz)
* views (bigint)
* likes (bigint)
* comments (bigint)
* shares (bigint)
* source (enum: api|public|manual)

**payouts**

* id (uuid, pk)
* submission\_id (uuid, fk -> submissions)
* amount\_cents (int)
* status (enum: pending|ready|paid|failed|held)
* computed\_at (timestamptz)
* details\_json (jsonb)

**disputes** (V1.5)

* id (uuid, pk)
* submission\_id (uuid)
* opened\_by (uuid)
* reason (text)
* status (enum: open|needs\_info|resolved|rejected)
* created\_at, updated\_at

**connections** (OAuth tokens per platform)

* id (uuid, pk)
* user\_id (uuid, fk -> users)
* platform (enum)
* external\_user\_id (text)
* access\_token (encrypted text)
* refresh\_token (encrypted text)
* expires\_at (timestamptz)
* scope (text)
* created\_at, updated\_at

**audit\_logs**

* id (uuid, pk)
* actor\_id (uuid)
* action (text)
* entity (text)
* entity\_id (uuid)
* metadata (jsonb)
* created\_at

**webhooks**

* id (uuid, pk)
* provider (text)
* payload (jsonb)
* signature (text)
* received\_at (timestamptz)

**indexes & constraints**

* Unique `(caption_code)` on campaigns
* Unique `(campaign_id, platform_media_id)` on submissions
* Index snapshots by `(submission_id, fetched_at)`

### RLS Examples (pseudocode)

* `submissions`: owners can `select`/`insert` their rows; brand owners can `select` rows where `campaign.brand_id == brand.id owned by brand.user_id`; admins bypass
* `payouts`: creators can read payouts for their submissions; brands read only amounts tied to their campaigns (no PII); admins full

---

## 5) Backend Services (Supabase)

### Edge Functions (TypeScript)

* `verify-post`: fetch post URL, extract media ID, verify caption code, store preview, first snapshot (YouTube: use public API)
* `poll-views`: given submission IDs, fetch latest counts, write snapshots (cron‑triggered)
* `compute-payouts`: compute deltas at cutoff, write payouts (admin/button or cron)
* `stripe-webhook`: handle account updates, payouts events, invoice issuance for brands
* `oauth-callbacks` (V1.5): IG/TikTok token exchange, store connections

### Cron & Queues

* **Vercel Cron** → invoke `poll-views` every 30–60 min (first 48h) then daily
* **Task queue**: Supabase “jobs” table or simple FIFO with status flags
* **Backoff/Rate limits** per platform

### Storage

* Buckets: `submissions/`, `previews/`, `evidence/`
* Use **signed URLs** (short expiry) and **upload policies**

---

## 6) Frontend (Next.js + shadcn/ui)

### Routing

* `/` Landing
* `/auth/*`
* `/onboarding` role select
* `/creator` dashboard
* `/creator/campaigns` (list)
* `/creator/campaigns/[id]` (detail)
* `/creator/submit/[campaignId]`
* `/creator/payouts`
* `/creator/accounts`
* `/brand` dashboard
* `/brand/campaigns`
* `/brand/campaigns/new`
* `/brand/campaigns/[id]`
* `/brand/review`
* `/brand/billing`
* `/admin/*`

### Key Components (shadcn/ui)

* Navigation: `Sidebar`, `Breadcrumb`, `Avatar`, `DropdownMenu`
* Data: `Table`, `Badge`, `Card`, `Tabs`, `Accordion`, `Chart` (via recharts)
* Forms: `Form`, `Input`, `Select`, `DatePicker`, `Textarea`, `Switch`, `Slider`
* Feedback: `Toast`, `Dialog`, `Alert`, `Skeleton`, `Tooltip`

### Design System

* **Branding:** minimal dark/light themes
* **Type:** Inter or SF; sizes `text-sm`–`text-2xl`
* **Color:** Neutral + accent for platform chips (YouTube/IG/TikTok)
* **Accessibility:** focus rings, labels, aria roles, keyboard nav

---

## 7) Tracking Logic & Payout Math

### Proof‑of‑Post

* **Caption marker**: unique per campaign (e.g., `#MX-4832`)
* **Visual marker**: semi‑transparent overlay with code; provide PNG pack; V2.0 auto‑apply at export
* **Claim link**: creator clicks to bind URL → submission record

### Snapshot Policy

* **Acceptance snapshot**: first valid fetch after approval
* **Warm period**: poll every 30–60 min for 48h
* **Cool period**: daily until cutoff (campaign end or creator cap)
* **Cutoff snapshot**: sealed for payout

### Payout Formula

* `incremental_views = max(views_cutoff - views_acceptance, 0)`
* `payout = min( floor(incremental_views / 1000) * payout_per_k, budget_remaining, creator_cap_remaining )`
* Rounding: cents; store `details_json` with math trail

---

## 8) Integrations

### Stripe Connect

* **Creators:** Connect onboarding; collect payouts; show status
* **Brands:** Payment methods, top‑ups/credits, invoicing
* **Webhooks:** account.updated, transfer.created, payout.paid/failed

### External Platforms

* **YouTube (MVP):** `videos.list?part=statistics&id=VIDEO_ID` for `viewCount`
* **Instagram (V1.5):** Graph API `/media/{id}/insights` for connected Business/Creator
* **TikTok (V1.5):** API for Business for connected accounts (metrics availability varies)

---

## 9) Security & Compliance

* **RLS everywhere** + least privilege SQL policies
* **Webhook verification** (Stripe signatures); replay protection
* **Token security:** encrypt at rest, short‑lived access tokens; scheduled refresh
* **File uploads:** signed upload URLs, MIME checks, size caps, AV scan (ClamAV worker optional)
* **Rate limiting:** per‑IP and per‑user (edge middleware)
* **Input validation:** zod on client + server
* **Secrets management:** Vercel env vars + Supabase secrets; no secrets in client
* **Logging & Audit:** append‑only audit table; PII minimization in logs
* **Legal:** Terms/Privacy; clear fee schedule; content policy; DMCA takedown

---

## 10) Admin & Ops

* **Flags & Rules:** spike detection, duplicate media IDs, missing caption code
* **Manual Actions:** approve/reject, hold payout, ban user, pause campaign
* **Disputes:** threaded comments, evidence upload, resolutions
* **Observability:** Sentry alerts, cron failure alerts, budget depletion alerts
* **Backups:** daily Postgres backups; tested restore runbooks

---

## 11) API Surface (Next.js Route Handlers → Supabase)

**Auth & Profile**

* `POST /api/auth/webhook` (Supabase auth events → profiles)
* `GET /api/me` (profile, role)

**Campaigns**

* `GET /api/campaigns` (filters: platform, rate\_min, budget\_left)
* `POST /api/campaigns` (brand only)
* `GET /api/campaigns/:id`
* `PATCH /api/campaigns/:id` (brand/admin)

**Submissions**

* `POST /api/submissions` {campaignId, postUrl}
* `GET /api/submissions?mine=1`
* `GET /api/submissions/:id`
* `POST /api/submissions/:id/verify` (calls Edge Function `verify-post`)

**Snapshots**

* `GET /api/submissions/:id/snapshots`

**Payouts**

* `POST /api/payouts/compute` (admin)
* `GET /api/payouts?mine=1`
* `POST /api/payouts/:id/pay` (admin V1.5 for automation)

**Connections (V1.5)**

* `GET /api/connections`
* `GET /api/oauth/:platform/start`
* `GET /api/oauth/:platform/callback`

**Webhooks**

* `POST /api/webhooks/stripe`

**Admin**

* `GET /api/admin/queues`
* `POST /api/admin/submissions/:id/decision` {approve|reject, note}
* `POST /api/admin/users/:id/ban`

---

## 12) Example RLS Policies (conceptual)

```sql
-- Only creator sees their submissions
create policy "creator_submissions" on submissions
for select using (auth.uid() = creator_id);

-- Brand sees submissions to their campaigns
create policy "brand_campaign_submissions" on submissions
for select using (
  exists(
    select 1 from campaigns c
    join brands b on b.id = c.brand_id
    where c.id = submissions.campaign_id and b.user_id = auth.uid()
  )
);

-- Admin bypass via is_admin flag on profiles
create policy "admin_all" on submissions
for all using (
  exists(select 1 from profiles p where p.user_id = auth.uid() and p.is_admin)
);
```

---

## 13) Testing Plan

* **Unit**: payout math, URL parsers, verification
* **Integration**: submission → verification → snapshot → payout
* **E2E**: Playwright flows for Creator & Brand
* **Security**: RLS tests (malicious access), webhook signature tests
* **Load**: polling rate with 1k/10k submissions

---

## 14) Rollout & Metrics

* **Alpha**: invite‑only brands, 50–100 creators; manual payouts
* **Beta (V1.5)**: add platform connections; automate payouts
* **GA (V2.0)**: enterprise features, SLAs

**North‑Star Metrics**

* Time to first payout (TTFP)
* \$ paid per creator / week
* % verified via API (vs URL‑only)
* Dispute rate < 2%, Fraud catch rate > 90%

---

## 15) Implementation Checklist (MVP)

1. Supabase project + schema + RLS
2. Stripe Connect setup (test mode) + webhooks
3. Next.js app shell + shadcn/ui + role‑based nav
4. Campaign create/list/detail
5. Submission form + verification Edge Function
6. YouTube polling cron + snapshots chart
7. Payout compute + admin queue
8. Basic admin dashboard (queues, user flags)
9. Legal pages & privacy
10. Sentry + basic analytics

---

## 16) Nice‑to‑Haves (Backlog)

* Creator levels/tiers (higher caps for connected accounts)
* Referral program (creators bring creators)
* Templates for captions/hashtags
* In‑app lightweight editor (FFmpeg, templates)
* Email digests: new campaigns, payout summaries

---

### End

This spec is designed so you can start coding immediately (Cursor‑friendly). Ask if you want SQL migration files, zod schemas, or example Edge Function code stubs next.
