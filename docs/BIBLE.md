# KULL 1 — App Bible

> Single source of truth for the entire KULL 1 platform.
> Living document. Updated as the build progresses.
> Last updated: 2026-05-12

---

## 1. What Is KULL 1

GPS-verified kayak bass fishing tournament platform. Three things:
1. **Website** (kull1.com) — marketing, tournament listings, news, club discovery
2. **Native App** (iOS + Android) — tournament ops: catch submission, GPS tracking, live leaderboard, payments
3. **API** (api.kull1.com) — backend serving both web and mobile

The moat: GPS verification eliminates self-reporting fraud. Every catch is timestamped, geolocated, and validated against the tournament boundary in real time.

---

## 2. Architecture (UPDATED 2026-05-12)

**KEY DECISION: Yakabass backend is the unified API. kull1-api (Node.js) is superseded.**

```
kull1.com (Vercel)                    KULL 1 App (Expo)
  Static marketing site                  Native iOS/Android
     │                                        │
     │    yakabass.kull1.com (Vercel)          │
     │    Club template (Next.js 16)          │
     │         │                              │
     └─────────┴──────────┬───────────────────┘
                          │
              yakabass-api-production.up.railway.app
              FastAPI + Python (UNIFIED BACKEND)
                          │
              ┌───────────┼───────────┐
         Neon PostgreSQL  Cloudflare R2  Clerk Auth
         (yakabass DB)    (photos)       (JWT RS256)
              │                │
         ┌────┴────┐    Stripe Connect
      30+ tables    (tournament payouts)
      Multi-tenant RLS
```

### Repos
| Repo | Location | Deploys To |
|------|----------|------------|
| kull1 (marketing + app) | github.com/r-db/kull1 | Vercel (marketing), EAS Build (app) |
| yakabass (club template + API) | github.com/r-db/yakabass | Vercel (frontend), Railway (backend) |
| ~~kull1-api~~ | ~~github.com/r-db/kull1-api~~ | ~~SUPERSEDED — use yakabass backend~~ |

### Tech Stack
| Layer | Technology |
|-------|-----------|
| Platform Marketing | Static HTML/CSS/JS (kull1.com) |
| Club Template | Next.js 16, React 19, Tailwind v4, Framer Motion (*.kull1.com) |
| Mobile App | Expo SDK 54, React Native 0.81, TypeScript |
| API | FastAPI + Uvicorn (Python) — 30+ route modules |
| Database | Neon PostgreSQL (multi-tenant with RLS, 30+ tables) |
| Auth | Clerk (JWT RS256, 4-tier RBAC) |
| Payments | Stripe Connect Express ($5 platform fee per event) |
| Photos | AWS S3 (presigned URLs) |
| Hosting | Vercel (web), Railway (API), EAS Build (app) |

---

## 3. Database Schema (14 Tables)

All tables live in the `kull1` database on Neon. Schema defined in Drizzle ORM at `api/src/db/schema.ts`.

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| users | Auth + roles | email, password_hash, role (angler/director/admin) |
| angler_profiles | Angler details | first_name, last_name, home_waters, career_catches |
| clubs | Tournament organizations | director_id, name, region, stripe_account_id |
| director_tax_info | KYC data | entity_type, ein_encrypted, ssn_encrypted |
| director_banking_info | Bank details (last 4 only) | routing_last4, acct_last4 |
| kyc_documents | Uploaded IDs | doc_type, s3_key |
| tournaments | Events | format, entry_fee_cents, boundary_geojson, start_at, end_at |
| tournament_registrations | Who's entered | tournament_id, user_id, paid_at, status |
| catches | Fish submissions | lat, lng, photo_s3_key, weight_oz, status |
| catch_disputes | Challenged catches | reason, resolution |
| tournament_leaderboards | Live rankings | total_weight_oz, catch_count, rank |
| aoy_standings | Angler of the Year | points, rank, season_year |
| payments | Entry fee records | amount_cents, platform_fee_cents, stripe_pi_id |
| payouts | Winner payments | amount_cents, stripe_transfer_id |

---

## 4. API Endpoints (20 Total)

All endpoints verified against live Neon database on 2026-05-12.

| Method | Path | Auth | Status |
|--------|------|------|--------|
| GET | /health | None | VERIFIED |
| POST | /api/auth/register | None | VERIFIED |
| POST | /api/auth/login | None | VERIFIED |
| POST | /api/auth/refresh | Refresh token | BUILT |
| POST | /api/auth/logout | JWT | BUILT |
| GET | /api/anglers/:id/profile | JWT | VERIFIED |
| GET | /api/anglers/:id/catches | JWT | BUILT |
| POST | /api/clubs/directors/onboard | None | VERIFIED |
| GET | /api/clubs/directors/:id/club | JWT (director) | BUILT |
| GET | /api/clubs | None | TESTED |
| GET | /api/clubs/:id | None | VERIFIED |
| GET | /api/clubs/:id/standings | None | BUILT |
| GET | /api/tournaments | None | VERIFIED |
| POST | /api/tournaments | JWT (director) | VERIFIED |
| GET | /api/tournaments/:id | None | VERIFIED |
| POST | /api/tournaments/:id/register | JWT | VERIFIED |
| GET | /api/tournaments/:id/leaderboard | None | TESTED |
| POST | /api/catches | JWT | BUILT |
| POST | /api/stripe/connect/onboard | JWT (director) | BUILT |
| POST | /api/stripe/payment-intent | JWT | BUILT |
| POST | /api/stripe/webhook | Stripe-Signature | BUILT |

---

## 5. Mobile App Screens

| Screen | Tab | File | Status |
|--------|-----|------|--------|
| Tournament List | Tournaments | (tabs)/index.tsx | BUILT |
| Tournament Detail | — | tournament/[id].tsx | BUILT |
| Leaderboard | Leaderboard | (tabs)/leaderboard.tsx | BUILT |
| Camera/Catch | Catch | (tabs)/catch.tsx | BUILT |
| Clubs | Clubs | (tabs)/clubs.tsx | BUILT |
| Profile | Profile | (tabs)/profile.tsx | BUILT |
| Login | Modal | login.tsx | BUILT |
| Register | Modal | register.tsx | BUILT |

### Core Libraries
| File | Purpose |
|------|---------|
| lib/api.ts | HTTP client with JWT auto-refresh |
| lib/auth.tsx | React context for auth state |
| lib/offline-queue.ts | Catch queue for dead zones |
| lib/location-service.ts | Background GPS + geofencing |

---

## 6. Key Flows

### Catch Submission Flow
1. Angler opens Catch tab → Camera activates
2. Positions fish on bump board → taps capture
3. Simultaneously: photo taken + GPS coordinates captured
4. Photo compressed on-device (1200px, 70% quality)
5. If online: FormData POST to /api/catches
6. If offline: saved to FileSystem queue, syncs when connected
7. Server validates: GPS in boundary? Time in window?
8. If valid → status = "verified", leaderboard updated
9. If boundary violation → rejected with reason

### Tournament Boundary Validation
- Tournament stores `boundary_geojson` (GeoJSON Polygon)
- Server uses ray-casting point-in-polygon algorithm
- No external dependency (turf.js removed — our implementation is sufficient)
- Client shows boundary on MapView with green Polygon overlay

---

## 7. Pricing Model

| Item | Amount |
|------|--------|
| Platform fee | $5.00 per angler per tournament |
| Director fee | $0 (free forever) |
| Angler subscription | $3.50/month |
| Entry fee | Set by director (any amount) |
| Payout timeline | 2-5 business days via Stripe Connect |

Revenue model: Platform takes $5 from every entry fee via Stripe `application_fee_amount`. Remainder goes to director's connected account. Director pays winners from their account.

---

## 8. Environment Variables

Documented in `api/.env.example`. Railway auto-injects DATABASE_URL and PORT.

---

## 9. Deployment Checklist

### API → Railway
- [ ] Create Railway project, link to r-db/kull1-api
- [ ] Add DATABASE_URL (Neon kull1 connection string)
- [ ] Add JWT_SECRET, JWT_REFRESH_SECRET
- [ ] Add STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET
- [ ] Add AWS credentials for S3
- [ ] Custom domain: api.kull1.com
- [ ] Verify health endpoint

### Website → Vercel (DONE)
- [x] Linked to r-db/kull1
- [x] Auto-deploy on push
- [ ] Custom domain kull1.com (DNS records needed in Cloudflare)

### App → EAS Build
- [ ] Configure eas.json
- [ ] iOS: Apple Developer account, provisioning profile
- [ ] Android: keystore generation
- [ ] First TestFlight build
- [ ] First Play Console internal test

---

## 10. Open Issues

See BUILD_TRACKER.md for full checklist. Key gaps:
1. Director onboard path differs from HANDBOOK spec (/api/clubs/directors/onboard vs /api/directors/onboard)
2. No token blacklist for logout (client-side only)
3. S3 needs AWS credentials configured
4. Stripe needs API keys configured
5. Offline queue built but not yet integrated into catch screen flow
6. Background location + geofencing built but not wired to tournament state
7. No EAS Build configuration yet

---

## 11. File Map

```
kull1/
├── index.html          # Homepage
├── *.html              # 26 static pages (see HANDBOOK.md)
├── HANDBOOK.md          # Website inventory + design system + data models
├── docs/
│   ├── BIBLE.md         # THIS FILE
│   ├── BUILD_TRACKER.md # Living checklist
│   └── RESEARCH.md      # Expo + competitors + Stripe research
├── app/                 # Expo native app
│   ├── src/app/         # Expo Router screens
│   ├── src/lib/         # API client, auth, offline queue, location
│   └── app.json         # Expo config with permissions
└── api/                 # (separate repo: r-db/kull1-api)
    ├── src/db/           # Drizzle schema + connection
    ├── src/routes/       # Express route handlers
    ├── src/middleware/    # Auth + error handling
    ├── src/services/     # S3 upload
    └── src/utils/        # GPS validation, JWT tokens
```
