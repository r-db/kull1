# KULL 1 — Platform Handbook
## Complete Site Inventory, Design System & Backend Integration Reference

> Version 1.0 — May 2026
> This document is the single source of truth for the KULL 1 platform. Every page, every form field, every design token, every content decision, and every backend integration point lives here.

---

## 1. Site Inventory

### 1.1 HTML Pages (26 total)

| File | Title | Nav Section | Purpose |
|------|-------|-------------|---------|
| `index.html` | KULL 1 — GPS-Verified Kayak Bass Fishing Tournaments | — | Homepage / marketing hero |
| `anglers.html` | For Anglers — KULL 1 | Anglers | Angler value prop, phone mockup |
| `directors.html` | For Tournament Directors — KULL 1 | Tournament Directors | Director value prop, Stripe Connect |
| `community.html` | Find Your Club — KULL 1 | Clubs | Club discovery, app download |
| `tournaments.html` | Find Tournaments — KULL 1 | — | Tournament browse/filter |
| `news.html` | News Room — KULL 1 | News Room | Articles, podcast, tournament results |
| `signup.html` | Unlock the Gate — KULL 1 | CTA | Registration (angler + director tabs) |
| `create-club.html` | Create Your Club — KULL 1 | — | Full director onboarding multi-step form |
| `about.html` | About KULL 1 | Footer | Mission, founding story, team |
| `contact.html` | Contact — KULL 1 | Footer | General inquiries, director support |
| `partners.html` | Partners & Sponsors — KULL 1 | Footer | Sponsorship tiers, current brands |
| `privacy.html` | Privacy Policy — KULL 1 | Footer | GDPR/CCPA, GPS data, Stripe |
| `terms.html` | Terms of Service — KULL 1 | Footer | Platform rules, Texas governing law |
| `cookies.html` | Cookie Policy — KULL 1 | Footer | Essential, functional, analytics |
| `article-how-tournaments-work.html` | How Kayak Bass Fishing Tournaments Work | News Room | Registration→GPS→scoring→payouts |
| `article-how-to-prepare.html` | How to Prepare for Your First Tournament | News Room | Gear, pre-fish, mental game |
| `article-safety.html` | Safety Items Every Kayak Angler Must Carry | News Room | PFDs, VHF, satellite, capsize |
| `article-regulations.html` | Tournament Regulations: What Every Angler Must Know | News Room | State licenses, size limits table, rules |
| `article-state-of-tournaments.html` | The State of Competitive Kayak Fishing After 2025 | News Room | Growth data, GPS adoption |
| `article-future-predictions.html` | Predictions: The Future of Competitive Kayak Fishing | News Room | 5-year timeline, national championship |

### 1.2 JS Files

| File | Purpose |
|------|---------|
| `cookie-banner.js` | Cookie consent banner — floating card, category toggles, localStorage key `kull1_cookies_v1` |
| *(inline `<script>` in signup.html)* | Tab switching (angler/director), entity type conditional fields, `required` toggling |
| *(inline `<script>` in news.html)* | Load More (batch 3), filter pills by `data-category` |

### 1.3 Assets

| File | Type | Used In |
|------|------|---------|
| `logo-fish.svg` | SVG | Nav (all pages) |
| `logo-full.svg` | SVG | — |
| `logo-fish.png` | PNG | Fallback |
| `logo-fish-2.png` | PNG | Alternate |
| `logo-full.png` | PNG | — |
| `logo-full-2.png` | PNG | — |
| `logo-full-transparent.png` | PNG | — |
| `logo-fish-transparent.png` | PNG | — |
| `lake-bg.jpg` | JPG | index.html (world pillars section bg), signup.html (left panel bg) |
| `catch-photo.png` | PNG | index.html (phone mockup screen) |
| `yak-a-bass.png` | PNG | — |
| `fish.png` | PNG | — |
| `sponsors/ketch-bg.jpg` | JPG | index.html sponsor strip |
| `sponsors/yakattack-bg.jpg` | JPG | index.html sponsor strip |
| `sponsors/lowrance-bg.jpg` | JPG | index.html sponsor strip |
| `sponsors/crescent-bg.jpg` | JPG | index.html sponsor strip |
| `sponsors/missile-bg.jpg` | JPG | index.html sponsor strip |

### 1.4 Other Files

| File | Purpose |
|------|---------|
| `llms.txt` | AI/LLM discovery — follows llmstxt.org standard. Lists all pages, formats, pricing, articles, podcast, legal. Linked from news.html `<link rel="alternate">` |
| `HANDBOOK.md` | This document |

---

## 2. Design System

### 2.1 Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `--bg-primary` | `#111` | Page background |
| `--bg-nav` | `#1A1E24` | Navigation bar |
| `--bg-dark` | `#0C0E10` | Phone notch, deepest sections |
| `--bg-footer` | `#0D0F12` | Footer background |
| `--bg-hero-alt` | `#13161A` | create-club.html hero |
| `--white` | `#FFFFFF` | Primary type, CTA backgrounds |
| `--text-muted-1` | `rgba(255,255,255,0.75)` | Article body copy |
| `--text-muted-2` | `rgba(255,255,255,0.55)` | Nav links default |
| `--text-muted-3` | `rgba(255,255,255,0.35)` | Labels, hints |
| `--text-muted-4` | `rgba(255,255,255,0.20)` | Footer copy |
| `--accent-live` | `#4ADE80` | LIVE indicators ONLY — never decorative |
| `--border-subtle` | `rgba(255,255,255,0.06)` | Section dividers |
| `--border-card` | `rgba(255,255,255,0.08)` | Card borders |
| `--form-bg-light` | `#F0EDE8` | signup.html right panel (light form surface) |

### 2.2 Typography

```
font-family: -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", sans-serif;
```

| Scale | Size | Weight | Letter-spacing | Usage |
|-------|------|--------|----------------|-------|
| Display | clamp(48px, 7vw, 96px) | 900 | -0.03em | Hero headlines |
| H1 | clamp(36px, 5vw, 72px) | 900 | -0.03em | Page headlines |
| H2 | 22px | 800 | -0.01em | Article section headers |
| H3 | 16px | 700 | 0 | Sub-headers |
| Nav wordmark | 17px | 800 | 0.18em | KULL 1 brand text |
| Nav links | 11px | 700 | 0.12em | Uppercase navigation |
| Micro label | 10–11px | 700 | 0.18–0.22em | Category tags, form labels |
| Body | 16px | 400 | 0 | Article body, value copy |
| Body small | 14px | 400 | 0 | Secondary copy |
| Legal/hint | 11–12px | 400–600 | 0.06em | Disclaimers, hints |

### 2.3 Spacing

| Context | Value |
|---------|-------|
| Desktop page gutter | 48px |
| Mobile page gutter | 24px |
| Section vertical padding (desktop) | 96px top / 80px bottom |
| Section vertical padding (mobile) | 64px top / 56px bottom |
| Card padding | 32–40px |
| Nav height | 80px |

### 2.4 Component Patterns

**Navigation (sticky, dark):**
- Height: 80px, background: `#1A1E24`, border-bottom: 1px `rgba(255,255,255,0.06)`
- Brand: fish SVG (62px tall, inverted white) + wordmark
- Links: 11px/700/0.12em uppercase, muted until hover/active
- CTA: "Unlock the Gate" — bordered outline button

**Cards:**
- Background: `rgba(255,255,255,0.03)` or transparent
- Border: 1px `rgba(255,255,255,0.08)`
- Border-radius: 8–10px
- NO multi-color accent borders — white only

**Phone Mockup (index.html + anglers.html):**
- `.phone-frame`: 280px wide, 580px tall (index) / 260px × 560px (anglers — note discrepancy)
- Background: `#0C0E10`, border-radius: 36px, border: 2px rgba(255,255,255,0.1)
- `.phone-notch`: absolute, top:14px, centered, 100px × 28px, bg `#0C0E10`, border-radius 14px
- `.phone-screen`: overflow hidden, contains scrollable content
- `.phone-bar` has `padding-top: 32px` to clear notch

**Timeline component (article-future-predictions.html):**
- Grid: 80px year column + 1fr content
- Year: 13px/800/0.06em, color `rgba(255,255,255,0.25)`
- Divider: 1px `rgba(255,255,255,0.06)` between items

**Filter Pills (news.html):**
- `data-filter` attribute on pills
- `data-category` attribute on article cards
- Active pill: white background, dark text
- Values: `platform`, `anglers`, `tournaments`, `gear`, `community`, `future`

---

## 3. Navigation Map

### 3.1 Main Nav (all pages except signup.html)
```
Anglers → anglers.html
Tournament Directors → directors.html
Clubs → community.html
News Room → news.html
[CTA] Unlock the Gate → signup.html
```

### 3.2 Footer Links
```
About → about.html
Contact → contact.html
Partners → partners.html
Privacy Policy → privacy.html
Terms of Service → terms.html
Cookie Policy → cookies.html
```

### 3.3 Internal Cross-Links
```
index.html → anglers.html, directors.html, tournaments.html, community.html, create-club.html, signup.html
news.html → article-*.html (6 articles)
article-*.html → news.html (Back to News Room), signup.html (CTA)
signup.html → terms.html, privacy.html, directors.html (Director Agreement)
create-club.html → terms.html, privacy.html
directors.html → create-club.html, signup.html
community.html → signup.html
anglers.html → signup.html
tournaments.html → signup.html
```

---

## 4. Form Inventory

### 4.1 Angler Registration Form (signup.html — "I'm an Angler" tab)

| Field ID | Label | Type | Placeholder | Required | Notes |
|----------|-------|------|-------------|----------|-------|
| `firstName` | First Name | text | Ryan | — | autocomplete: given-name |
| `lastName` | Last Name | text | Carter | — | autocomplete: family-name |
| `phone` | Phone Number | tel | (555) 000-0000 | YES | autocomplete: tel |
| `email` | Email Address | email | you@example.com | — | autocomplete: email |
| `password` | Password | password | Create a password | — | autocomplete: new-password |
| `homeWaters` | Home Waters | text | Lake Seminole, GA | — | |
| `species` | Primary Species | select | — | — | Options: Largemouth Bass, Smallmouth Bass, Spotted Bass, Striped Bass, Crappie, Walleye, Catfish, Trout, Other |

**Action:** POST to `/api/auth/register` (role: angler)

### 4.2 Director Registration Form (signup.html — "I'm a Tournament Director" tab)

**Contact Section:**

| Field ID | Label | Type | Required |
|----------|-------|------|----------|
| `dFirstName` | First Name | text | YES |
| `dLastName` | Last Name | text | YES |
| `dPhone` | Phone Number | tel | YES |
| `dEmail` | Email Address | email | YES |
| `dPassword` | Password | password | YES |
| `clubName` | Club / Organization Name | text | YES |
| `clubRegion` | Home Region | text | YES |

**Legal & Tax Section:**

| Field ID | Label | Type | Required | Notes |
|----------|-------|------|----------|-------|
| `entityType` | Entity Type | select | YES | Options: individual, llc, corp, partnership, nonprofit |
| `bizName` | Legal Business Name | text | If company | Shown for llc/corp/partnership/nonprofit |
| `ein` | EIN | text | If company | Format XX-XXXXXXX, maxlength 10, for IRS 1099-K |
| `bizAddress` | Registered Business Address | text | If company | |
| `ssn` | Social Security Number | text | If individual | Format XXX-XX-XXXX, maxlength 11, AES-256 encrypted |
| `homeAddress` | Home Address | text | If individual | |

**Banking Section:**

| Field ID | Label | Type | Required |
|----------|-------|------|----------|
| `bankName` | Bank Name | text | YES |
| `acctHolder` | Account Holder Name | text | YES |
| `acctType` | Account Type | select | YES (Checking/Savings) |
| `routing` | Routing Number | text | YES (9-digit ABA, maxlength 9) |
| `acctNum` | Account Number | text | YES |

**Action:** POST to `/api/directors/onboard`

### 4.3 Create Club Form (create-club.html)

Multi-section form with numbered steps. Fields to be documented on full read — mirrors director tab fields with additional tournament configuration options including:
- Tournament boundary (GeoJSON/map)
- Payout structure configuration
- KYC document uploads (state-issued ID, voided check)
- Agreement checkboxes (Terms, Director Agreement, Privacy Policy)

**Action:** POST to `/api/directors/onboard` (full version)

---

## 5. Content Index

### 5.1 Tournament Formats

| Format | Description |
|--------|-------------|
| Big Bass | Single heaviest fish wins. Favors quality over quantity. |
| Five-Fish Limit | Five heaviest fish combined. Most common club format. |
| Slot Limit | Fish must fall within a defined length window. Protects trophy broodstock. |
| Multi-Day | Two-day events with field cuts. Season-long point circuits with championship events. |

### 5.2 Pricing Facts

| Item | Price |
|------|-------|
| Platform fee | $5.00 per angler per tournament event |
| Subscription fee | $3.50 per angler subscription |
| Director monthly fee | $0 (free forever) |
| Payout timeline | 2–5 business days via Stripe Connect |
| Entry fee split | Automatic at moment of payment |

### 5.3 Articles

| File | Title | Category | Date | Read Time |
|------|-------|----------|------|-----------|
| `article-how-tournaments-work.html` | How Kayak Bass Fishing Tournaments Work | Platform | Apr 5, 2026 | 8 min |
| `article-how-to-prepare.html` | How to Prepare for Your First Tournament | Anglers | Mar 28, 2026 | 7 min |
| `article-safety.html` | Safety Items Every Kayak Angler Must Carry | Anglers | Mar 20, 2026 | 6 min |
| `article-regulations.html` | Tournament Regulations: What Every Angler Must Know | Tournaments | Mar 15, 2026 | 10 min |
| `article-state-of-tournaments.html` | The State of Competitive Kayak Fishing After 2025 | Platform | Mar 8, 2026 | 9 min |
| `article-future-predictions.html` | Predictions: The Future of Competitive Kayak Fishing | Future | Apr 7, 2026 | 7 min |

### 5.4 Podcast — The Long Cast

| Episode | Title | Status |
|---------|-------|--------|
| EP. 01 | The State of Kayak Bass Fishing — Where the Sport Is, Where It's Going | Published |
| EP. 02 | On the Water with a Champion — A Kayak Bass Fisherman Tells His Story | Published |
| EP. 03 | Bass Fishing in the West — Patterns, Waters, and What's Different Out Here | Published |
| EP. 12 | Tournament Fishing's Integrity Problem — and the Only Fix That Actually Works | Coming Soon |

### 5.5 GPS Verification — How It Works

1. Angler submits catch via mobile app at moment of catch
2. Platform captures: GPS coordinates (angler's live position), server-side timestamp (immutable), photo of fish on bump board
3. Submissions outside tournament boundary → automatically flagged
4. Submissions after closing window → rejected
5. Self-reporting fraud eliminated by design

---

## 6. SEO Index

| Page | Title | Description | JSON-LD Type |
|------|-------|-------------|--------------|
| `index.html` | KULL 1 — GPS-Verified Kayak Bass Fishing | GPS-verified kayak tournaments... | Organization + WebSite |
| `anglers.html` | For Anglers — KULL 1 | Your permanent fishing record... | WebPage |
| `directors.html` | For Tournament Directors — KULL 1 | Create a club, run circuits... | WebPage |
| `news.html` | News Room — KULL 1 | Tournament results, platform updates... | WebPage |
| `article-*.html` | (individual) | (individual) | Article |

All article pages include:
- `<meta name="robots" content="index, follow">`
- Open Graph `og:title`, `og:description`, `og:type: article`
- JSON-LD Article schema with `datePublished`, `author`, `publisher`, `keywords`

`llms.txt` linked via `<link rel="alternate" type="text/plain" title="LLMs.txt" href="llms.txt">` in news.html.

---

## 7. Placeholder Inventory (What Still Needs Real Data)

| Location | Placeholder | What's Needed |
|----------|-------------|---------------|
| `community.html` app badges | `href="#"` | Real App Store / Google Play URLs |
| `tournaments.html` app badges | `href="#"` | Real App Store / Google Play URLs |
| `index.html` sponsor strip | Static BG images | Real sponsor logos + live links |
| `tournaments.html` | Static tournament cards | Live DB query → tournament listings |
| `community.html` | Static club cards | Live DB query → club listings |
| All forms | `onsubmit="return false;"` | Real API endpoints wired |
| `signup.html` "Sign in" link | `onclick="return false;"` | Real login flow / page |
| `directors.html` | Static content | Real director dashboard link |
| `news.html` podcast | Episode links | Real podcast host embed / URLs |

---

## 8. Backend Integration Points

### 8.1 Form Submissions → API Endpoints

| Form | Current State | Target Endpoint |
|------|--------------|-----------------|
| Angler registration | `return false` (no-op) | `POST /api/auth/register` |
| Director registration | `return false` (no-op) | `POST /api/directors/onboard` |
| Create Club full form | `return false` (no-op) | `POST /api/directors/onboard` |

### 8.2 Data Fetches Required

| Page | Data Needed | Endpoint |
|------|-------------|----------|
| `tournaments.html` | Active tournaments with filters | `GET /api/tournaments?state=&format=&maxFee=` |
| `community.html` | Active clubs by region | `GET /api/clubs?region=` |
| `news.html` | Tournament results (latest) | `GET /api/tournaments?status=completed&limit=3` |

### 8.3 Stripe Integration Points

| Flow | Implementation |
|------|---------------|
| Director banking | Stripe Connect Express onboarding — collect routing/acct → Stripe external_account |
| Tournament registration payment | `POST /api/tournaments/:id/register` → create PaymentIntent with `application_fee_amount: 500`, `transfer_data.destination: club.stripe_account_id` |
| Winner payout | Manual transfer post-tournament — `POST /api/tournaments/:id/payouts` → Stripe Transfer to winner's connected account |
| Webhooks | `payment_intent.succeeded`, `account.updated`, `transfer.created` → `/api/stripe/webhook` |

### 8.4 GPS Validation Logic

```
On catch submission:
1. Parse lat/lng from mobile client
2. Load tournament.boundary_geojson
3. Point-in-polygon check (Haversine or turf.js)
4. If outside boundary → reject, status = "boundary_violation"
5. Check submitted_at <= tournament.end_at
6. If outside window → reject, status = "time_violation"
7. If valid → store catch, update leaderboard
```

### 8.5 S3 Photo Storage

```
On catch submission:
- Accept multipart/form-data with photo field
- Validate: JPEG/PNG, max 10MB
- Key: catches/{tournament_id}/{user_id}/{uuid}.jpg
- Store presigned URL reference in catches.photo_s3_key
- Return presigned GET URL for leaderboard display
```

---

## 9. Deployment Architecture

```
GitHub
├── kull1-frontend (this repo — static HTML/CSS/JS)
│   └── → Vercel (auto-deploy on push to main)
│       └── → kull1.com (custom domain, SSL auto)
│
└── kull1-api (Node.js/Express backend)
    └── → Railway
        ├── Node.js service (API server, PORT auto-injected)
        └── PostgreSQL service (DATABASE_URL auto-injected)
            → api.kull1.com (custom domain, SSL auto)
```

### Environment Variables (kull1-api)

| Variable | Source | Notes |
|----------|--------|-------|
| `DATABASE_URL` | Railway auto | PostgreSQL connection string |
| `JWT_SECRET` | Manual | 256-bit random secret |
| `JWT_REFRESH_SECRET` | Manual | Separate refresh token secret |
| `STRIPE_SECRET_KEY` | Stripe Dashboard | `sk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | Stripe Dashboard | `whsec_...` |
| `AWS_ACCESS_KEY_ID` | AWS IAM | S3 photo storage |
| `AWS_SECRET_ACCESS_KEY` | AWS IAM | |
| `AWS_REGION` | Manual | e.g., `us-east-1` |
| `S3_BUCKET` | Manual | e.g., `kull1-catches` |
| `SENDGRID_API_KEY` | SendGrid | Transactional email |
| `CLIENT_URL` | Manual | `https://kull1.com` (for CORS) |
| `PORT` | Railway auto | Server listen port |

---

## 10. Data Models (14 Tables)

```sql
-- Core auth
users(id, email, password_hash, role, phone, verified_at, created_at)

-- Profiles
angler_profiles(user_id, first_name, last_name, home_waters, primary_species, state, career_catches, career_tournaments, created_at)

-- Club structure
clubs(id, director_id, name, region, stripe_account_id, status, created_at)
director_tax_info(club_id, entity_type, ein_encrypted, ssn_encrypted, business_name, address)
director_banking_info(club_id, stripe_account_id, bank_name, acct_holder, acct_type, routing_last4, acct_last4, verified_at)
kyc_documents(id, club_id, doc_type, s3_key, uploaded_at, verified_at)

-- Tournaments
tournaments(id, club_id, name, format, entry_fee_cents, boundary_geojson, start_at, end_at, status, max_anglers, created_at)
tournament_registrations(id, tournament_id, user_id, paid_at, stripe_payment_intent_id, status)

-- Catches
catches(id, tournament_id, user_id, photo_s3_key, lat, lng, submitted_at, length_in, weight_oz, species, status)
catch_disputes(id, catch_id, raised_by, reason, resolved_at, resolution)

-- Results
tournament_leaderboards(tournament_id, user_id, rank, total_weight_oz, catch_count, updated_at)
season_standings(club_id, season_year, user_id, points, rank, updated_at)

-- Financials
payments(id, tournament_id, user_id, amount_cents, platform_fee_cents, stripe_payment_intent_id, status, created_at)
payouts(id, tournament_id, user_id, amount_cents, stripe_transfer_id, paid_at, status)
```

---

## 11. API Endpoint Reference

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | None | Create user + profile |
| POST | `/api/auth/login` | None | Issue JWT + refresh token |
| POST | `/api/auth/refresh` | Refresh token | Rotate access token |
| POST | `/api/auth/logout` | JWT | Invalidate refresh token |
| GET | `/api/anglers/:id/profile` | JWT | Angler profile + career stats |
| GET | `/api/anglers/:id/catches` | JWT | All verified catches (career record) |
| POST | `/api/directors/onboard` | None | Create club + tax + bank + Stripe Connect |
| GET | `/api/directors/:id/club` | JWT | Club details |
| GET | `/api/tournaments` | None | Browse: ?state=&format=&maxFee=&status= |
| POST | `/api/tournaments` | JWT (director) | Create tournament |
| GET | `/api/tournaments/:id` | None | Tournament detail + boundary |
| POST | `/api/tournaments/:id/register` | JWT | Pay entry, join tournament |
| POST | `/api/catches` | JWT | Submit catch (multipart: photo + GPS) |
| GET | `/api/tournaments/:id/leaderboard` | None | Live standings |
| GET | `/api/clubs` | None | Browse clubs: ?region= |
| GET | `/api/clubs/:id` | None | Club page + past tournaments |
| GET | `/api/clubs/:id/standings` | None | Season standings |
| POST | `/api/stripe/webhook` | Stripe-Signature | Handle Stripe events |
| GET | `/health` | None | `{"status":"ok","version":"1.0.0"}` |

---

## 12. Known Issues & TODOs

| Priority | Item | Location |
|----------|------|---------|
| P0 | All forms are no-ops — backend not wired | signup.html, create-club.html |
| P0 | Tournament listings are static placeholders | tournaments.html |
| P0 | Club listings are static placeholders | community.html |
| P1 | App store badge links are `href="#"` | community.html, tournaments.html |
| P1 | "Sign in" link is a no-op | signup.html |
| P1 | Angler firstName/lastName missing `required` attribute | signup.html |
| P1 | Phone mockup height mismatch: index.html (580px) vs anglers.html (560px) | anglers.html |
| P2 | Sponsor logos are static JPG BGs — need real brand assets | index.html |
| P2 | Podcast episode links not connected to real audio host | news.html |
| P2 | No mobile nav hamburger menu on anglers.html, directors.html | — |
| P3 | No 404.html page | — |
| P3 | No sitemap.xml | — |
| P3 | No robots.txt | — |
