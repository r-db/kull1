# KULL 1 — Build Tracker

> Living document. Updated every time something is built, tested, or verified.
> NOTHING is marked complete without verification. "Built" != "Tested" != "Verified".

---

## Status Key
- [ ] NOT STARTED
- [B] BUILT — code written, not tested
- [T] TESTED — ran and passed locally
- [V] VERIFIED — tested end-to-end with real data flow

---

## PHASE 1: Backend API (Node.js + Express + Neon PostgreSQL)

### Infrastructure
- [V] Project scaffold (package.json, tsconfig, folder structure)
- [V] Database connection (Neon PostgreSQL) — connected, queries work
- [V] Database schema migration (14 tables from HANDBOOK) — drizzle-kit push verified, 14 tables confirmed
- [V] JWT auth middleware — tested via register+login flow
- [T] Error handling middleware — catches AppError, logs unhandled
- [V] CORS configuration — working on localhost
- [ ] Railway deployment config
- [T] Environment variables documented — .env.example created

### Auth Endpoints
- [V] POST /api/auth/register — user created in DB, JWT returned, angler profile created
- [V] POST /api/auth/login — password verified, JWT returned
- [B] POST /api/auth/refresh — code written, not tested
- [B] POST /api/auth/logout — code written (client-side only for now)

### Angler Endpoints
- [V] GET /api/anglers/:id/profile — returns full profile with career stats
- [B] GET /api/anglers/:id/catches — code written, needs catch data to test

### Director/Club Endpoints
- [V] POST /api/clubs/directors/onboard — director created, club created, tax+banking saved
- [B] GET /api/clubs/directors/:id/club — code written, not tested
- [T] GET /api/clubs — returns [] (correct: only shows active clubs)
- [V] GET /api/clubs/:id — returns club + tournaments
- [B] GET /api/clubs/:id/standings — code written, needs AOY data

### Tournament Endpoints
- [V] GET /api/tournaments — returns list with club join, filters work
- [V] POST /api/tournaments — tournament created with boundary GeoJSON
- [V] GET /api/tournaments/:id — detail with registeredCount
- [V] POST /api/tournaments/:id/register — registration created, duplicate blocked
- [T] GET /api/tournaments/:id/leaderboard — returns [] (correct: no catches yet)

### Catch Endpoints
- [B] POST /api/catches — code written with GPS validation + S3 upload
- [B] GPS point-in-polygon validation — ray casting algorithm implemented
- [B] Time window validation — start/end check implemented
- [B] S3 photo upload + presigned URL generation — code written, needs AWS creds

### Stripe Integration
- [B] Stripe Connect Express account creation — lazy init, code written
- [B] Payment intent with application_fee_amount — $5 platform fee coded
- [B] POST /api/stripe/webhook — payment_intent.succeeded + account.updated handlers
- [ ] Payout transfer to winners

### Health
- [V] GET /health — returns {"status":"ok","version":"1.0.0"}

---

## PHASE 2: Expo Native App (React Native)

### Infrastructure
- [T] Expo project scaffold (expo-router, TypeScript) — compiles clean
- [T] Navigation structure (tabs + stacks) — 5 tabs + modal stacks
- [T] API client (base URL, JWT token management) — with auto-refresh on 401
- [ ] Offline storage layer (SQLite/AsyncStorage)
- [ ] Push notification setup (expo-notifications)
- [ ] EAS Build configuration
- [ ] App icons + splash screen

### Auth Screens
- [B] Login screen — email/password, error handling
- [B] Register screen (angler) — 6 fields, validation
- [ ] Register screen (director tab)
- [B] JWT token storage (secure store) — expo-secure-store integrated
- [B] Auto-refresh token on 401 — in api.ts

### Tournament Screens
- [B] Tournament browse/filter screen — FlatList with pull-to-refresh
- [B] Tournament detail screen (with map boundary) — MapView + Polygon
- [B] Tournament registration flow — register button wired
- [ ] Active tournament screen (during event)

### Catch Submission (CORE FEATURE)
- [B] Camera capture screen — CameraView with capture button
- [ ] EXIF GPS extraction from photo
- [B] Live GPS location overlay — shows lat/lng + accuracy
- [B] On-device image compression before upload — resize to 1200px, 70% quality
- [ ] Offline catch queue (no signal = save locally, sync later)
- [B] Catch submission API call — FormData with photo + GPS
- [ ] Geofence boundary validation (client-side preview)
- [ ] Catch confirmation + receipt screen

### Leaderboard
- [B] Live leaderboard screen — ranked list with weight display
- [ ] Catch photo gallery per tournament
- [ ] Angler stats card

### Location Services
- [ ] Background GPS tracking during tournament
- [ ] Geofence definition from tournament boundary_geojson
- [ ] Geofence enter/exit notifications
- [ ] Location permission handling (iOS + Android)

### Profile
- [B] Angler profile screen — avatar, email, role, stats, sign out
- [ ] Career catch history
- [ ] AOY standings
- [ ] Settings

### Director Features
- [ ] Create tournament form
- [ ] Set tournament boundary (map drawing)
- [ ] Manage registrations
- [ ] Approve/dispute catches
- [ ] Trigger payouts

---

## PHASE 3: Wire Website to Live API

- [ ] tournaments.html — live tournament listings from API
- [ ] community.html — live club listings from API
- [ ] signup.html — angler registration wired to API
- [ ] signup.html — director registration wired to API
- [ ] create-club.html — full onboarding wired to API
- [ ] Login flow implemented
- [ ] App Store badge links updated

---

## PHASE 4: Integration Testing

- [ ] Register angler → login → browse tournaments → register for tournament → pay
- [ ] Director onboard → create tournament → set boundary → go live
- [ ] Angler submits catch inside boundary → leaderboard updates
- [ ] Angler submits catch outside boundary → rejected
- [ ] Angler submits catch after time window → rejected
- [ ] Offline catch submission → comes online → syncs → appears on leaderboard
- [ ] Background GPS tracking → geofence alert on boundary exit
- [ ] Stripe payment → platform fee split → director payout
- [ ] Photo upload → S3 → presigned URL → visible on leaderboard

---

## BUGS / ISSUES (add as discovered)

| # | Description | Location | Status |
|---|-------------|----------|--------|
| 1 | Stale process on port caused false 500 errors | server startup | RESOLVED — kill stale processes before testing |
| 2 | Express 5 req.params returns string\|string[] | routes/*.ts | RESOLVED — cast to string |
| 3 | Stripe SDK crashes without key on module load | routes/stripe.ts | RESOLVED — lazy init via getStripe() |
| 4 | clubs.ts mounted at /api caused route collision | index.ts | RESOLVED — removed duplicate mount |
| 5 | Director onboard route at /api/clubs/directors/onboard not /api/directors/onboard | clubs.ts | NOTED — works but differs from HANDBOOK spec |

---

## DECISIONS LOG (add as made)

| Date | Decision | Reason |
|------|----------|--------|
| 2026-05-12 | Expo (React Native) over PWA | Geofencing + background GPS requires native |
| 2026-05-12 | Neon PostgreSQL over Railway Postgres | Already use Neon, shared infra knowledge |
| 2026-05-12 | Node.js/Express backend | HANDBOOK spec, matches frontend ecosystem |
| 2026-05-12 | Stripe Connect Express | Handles KYC, 1099-K, reduces our compliance burden |
| 2026-05-12 | Drizzle ORM over Prisma | Lighter, SQL-like, better for this project size |
| 2026-05-12 | Separate kull1 database in existing Neon project | Avoids table conflicts with IB365/neondb |
| 2026-05-12 | Dark mode default for app | Matches website design system (#111 bg) |

---

*Last updated: 2026-05-12 17:10 UTC*
