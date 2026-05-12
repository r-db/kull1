# KULL 1 — Consolidated Research

**Date:** 2026-05-12
**Covers:** Expo SDK 55 capabilities, fishing tournament competitor analysis, Stripe Connect marketplace payments

---

## Part 1: Expo SDK 55 — GPS-Verified Tournament App

**SDK Version:** Expo SDK 55 (React Native 0.83). SDK 52/53 are outdated.

### 1.1 expo-location: Background GPS & Geofencing

**Background location tracking:**
```ts
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';

const LOCATION_TASK = 'tournament-gps-tracking';

// MUST be at TOP-LEVEL SCOPE (outside components)
TaskManager.defineTask(LOCATION_TASK, ({ data, error }) => {
  if (error) return;
  const { locations } = data as { locations: Location.LocationObject[] };
  // Save to local storage, check geofence, etc.
});

// Start tracking
await Location.startLocationUpdatesAsync(LOCATION_TASK, {
  accuracy: Location.Accuracy.High,          // ~10m
  distanceInterval: 10,                      // meters
  deferredUpdatesInterval: 5000,             // ms
  showsBackgroundLocationIndicator: true,    // iOS blue bar
  foregroundService: {                       // Android REQUIRED
    notificationTitle: 'Tournament Active',
    notificationBody: 'GPS tracking for catch verification',
    notificationColor: '#00FF00',
  },
});
```

**LocationAccuracy enum:**

| Value | Name | Accuracy |
|-------|------|----------|
| 1 | `Lowest` | ~3 km |
| 3 | `Balanced` | ~100 m |
| 4 | `High` | ~10 m |
| 5 | `Highest` | Best available |
| 6 | `BestForNavigation` | Best + sensor fusion (most battery) |

**Geofencing API:**
```ts
Location.startGeofencingAsync(taskName, regions: LocationRegion[]);

interface LocationRegion {
  identifier?: string;
  latitude: number;
  longitude: number;
  radius: number;         // METERS — circles only
  notifyOnEnter?: boolean;
  notifyOnExit?: boolean;
}
```

**CRITICAL: Geofencing only supports CIRCLES.** No polygon support. For lake boundary enforcement:
1. **transistorsoft Background Geolocation SDK** ($299/yr) — polygon geofences via C++ hit-testing
2. **Manual point-in-polygon** — Turf.js `booleanPointInPolygon()` against background location updates
3. Multiple overlapping circles (crude, wastes geofence slots: iOS max 20, Android max 100)

**iOS vs Android — background GPS when app is killed:**

| Scenario | iOS | Android |
|----------|-----|---------|
| App in background | YES | YES (foreground service) |
| App swiped from recents | YES (system restarts app) | UNRELIABLE (OEM-dependent) |
| Device rebooted | YES (re-registers on boot) | NO (must reopen app) |
| Geofence after kill | YES | NO |

Android background GPS is the single biggest technical risk. Samsung/Xiaomi/Huawei aggressively kill background services.

**Permissions required:**
```json
// app.json
["expo-location", {
  "locationAlwaysAndWhenInUsePermission": "Allow [App] to track your location during tournaments.",
  "isIosBackgroundLocationEnabled": true,
  "isAndroidBackgroundLocationEnabled": true
}]
```
Must request foreground permission FIRST, then background separately. Android 14+ requires `FOREGROUND_SERVICE` + `FOREGROUND_SERVICE_LOCATION`.

### 1.2 expo-camera: Photo Capture & GPS EXIF

**expo-camera does NOT automatically embed GPS in photos.** You must manually inject it:

```ts
import { CameraView } from 'expo-camera';

// Get location first
const location = await Location.getCurrentPositionAsync({
  accuracy: Location.Accuracy.High,
});

// Capture with GPS injected
const photo = await cameraRef.current.takePictureAsync({
  exif: true,
  additionalExif: {
    GPSLatitude: location.coords.latitude,
    GPSLongitude: location.coords.longitude,
    GPSAltitude: location.coords.altitude,
    GPSTimeStamp: new Date().toISOString(),
  },
});
```

**Android EXIF limitation:** Only `GPSLatitude`, `GPSLongitude`, `GPSAltitude` reliably persist. Tags like `GPSSpeed`, `GPSImgDirection` are silently dropped.

**Video recording:**
```ts
const video = await cameraRef.current.recordAsync({
  maxDuration: 30,    // seconds
  maxFileSize: 50000000,  // bytes
});
// Returns { uri: string }
```

**Gotchas:**
- Must wait for `onCameraReady` before calling `takePictureAsync`
- Android silently drops unsupported EXIF tags (no error thrown)
- Requires development build for full functionality

### 1.3 expo-image-manipulator: Compression

```ts
import * as ImageManipulator from 'expo-image-manipulator';

const result = await ImageManipulator.manipulateAsync(
  photo.uri,
  [{ resize: { width: 1600 } }],
  { compress: 0.7, format: SaveFormat.JPEG }
);
```

**CRITICAL: iOS vs Android produce 36x different file sizes** at the same `compress` value. At `compress: 0`, a 5000x5000px image: Android = ~73KB, iOS = ~2.7MB. Plan for platform-specific quality tuning.

**SaveFormat:** JPEG (lossy, fast), PNG (lossless, ignores compress param), WEBP (best ratio, iOS 14+).

### 1.4 expo-file-system: Offline Storage

```ts
import { File, Directory, Paths } from 'expo-file-system';

const file = new File(Paths.document, 'catches.json');
file.write(JSON.stringify(catchData));
const text = await file.text();
```

| Directory | Survives update? | System can delete? |
|-----------|-----------------|-------------------|
| `Paths.document` | Yes | No |
| `Paths.cache` | No guarantee | Yes |

**No built-in upload queue.** Build your own:
1. Save catch data + photo to `Paths.document`
2. Maintain JSON queue of pending uploads
3. Use `@react-native-community/netinfo` for connectivity detection
4. Upload on connectivity restore, remove from queue on success

Legacy API has iOS background upload sessions (`FileSystemSessionType.BACKGROUND`) that retry even when backgrounded.

### 1.5 expo-notifications: Push

```ts
import * as Notifications from 'expo-notifications';

// Get push token
const token = await Notifications.getExpoPushTokenAsync({
  projectId: 'your-expo-project-id',
});

// Interactive categories (for catch approval)
await Notifications.setNotificationCategoryAsync('catch-verify', [
  { identifier: 'approve', buttonTitle: 'Approve Catch', options: { opensAppToForeground: true } },
  { identifier: 'dispute', buttonTitle: 'Dispute', options: { opensAppToForeground: true },
    textInput: { placeholder: 'Reason for dispute', submitButtonTitle: 'Submit' } },
]);
```

**Gotchas:**
- Android: `setNotificationChannelAsync` must be called BEFORE `getExpoPushTokenAsync` on Android 13+
- iOS: 5 auth states (NOT_DETERMINED, DENIED, AUTHORIZED, PROVISIONAL, EPHEMERAL) — check `settings.ios?.status`
- FCM V1 credentials required for Android
- Apple Developer Account ($99/yr) required for iOS

### 1.6 Expo Router: File-Based Navigation

```
src/app/
  _layout.tsx              --> Root layout (Stack)
  (tabs)/
    _layout.tsx            --> Tab bar
    index.tsx              --> Dashboard
    map.tsx                --> Live Map
    catches/
      _layout.tsx          --> Stack inside catches tab
      index.tsx            --> Catch list
      [catchId].tsx        --> Catch detail
      new.tsx              --> New catch submission
    profile.tsx            --> Profile
  sign-in.tsx              --> Auth (outside tabs)
```

Auth protection via `Stack.Protected`:
```tsx
<Stack.Protected guard={isLoggedIn}>
  <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
</Stack.Protected>
```

### 1.7 EAS Build & Distribution

**TestFlight (single command):**
```sh
npx testflight
```
Handles build + sign + submit + TestFlight upload. Available to testers in 10-15 minutes.

**Google Play:** First upload must be manual. After that, `eas submit --platform android` works via API.

### 1.8 Background Tasks

**For continuous GPS:** Use `expo-location` + `expo-task-manager` (covered in 1.1).

**For periodic sync (data upload):** Use `expo-background-task`:
```ts
TaskManager.defineTask('sync-catches', async () => {
  await syncPendingCatches();
  return BackgroundTask.BackgroundTaskResult.Success;
});

await BackgroundTask.registerTaskAsync('sync-catches', {
  minimumInterval: 60, // minutes (15 min minimum on both platforms)
});
```

`expo-background-fetch` is deprecated. Replaced by `expo-background-task` (uses `BGTaskScheduler` on iOS, `WorkManager` on Android).

---

## Part 2: Fishing Tournament Competitor Analysis

### 2.1 Competitor Profiles

#### TourneyX — Market Leader in Kayak Bass
- **Rating:** 4.7/5 (108 ratings, iOS) — highest user satisfaction
- **Pricing:** $6.50/angler, invoiced to tournament director post-event. No contracts. Free for anglers.
- **GPS:** Geotag + timestamp in photo submissions. Only directors see exact catch location.
- **Payments:** PayPal only (no Stripe, no cards)
- **Tournament types:** Team, multi-day, single-day, showdown, no cull, auto cull, custom
- **Key features:** AutoCull, check-in/check-out safety, badge system, X Map
- **Top complaint:** 10-minute catch upload process (take photo, open app, browse, wait, enter livewell info)
- **Missing:** No AI verification, no geofencing, no video, no offline mode, PayPal-only

#### Fishing Chaos — KBF Official Platform + Bass Pro Partnership
- **Rating:** 4.0/5 (82 ratings, iOS)
- **Pricing:** Anglers: $3.99/mo or $43.89/yr. Directors: convenience fee per tournament.
- **Partnerships:** B.A.S.S. Nation, Bass Pro Shops (2026), CCA, Lews, Strike King, Humminbird. 2026 U.S. Open Bowfishing Championship ($100K+ prizes).
- **Key features:** Pro tournament scales (wireless), mass messaging, in-app chat, big screen presentation mode, Pro/Am
- **Missing:** No AI verification, no geofencing, subscription wall alienates casual anglers

#### FishDonkey — Best Anti-Cheat (Patented)
- **Rating:** 4.0/5 (84 ratings, iOS)
- **Last update:** December 2023 (18 months stale — red flag)
- **Anti-cheat:** Patented CPVR (Catch Photo Video Release). Validates all photos/videos. Rejects old/altered/manipulated images. In-app camera only (no camera roll).
- **Scale:** 171K registered anglers, 18K tournaments, 1.8M fish photos, 276K release videos, 10 countries
- **Offline:** Yes (Digital Livewell works without internet)
- **Missing:** No AI measurement, no geofencing, stale development

#### eTournament Fishing — Best Geofencing
- **Rating:** 4.3/5 (15 ratings, iOS)
- **Pricing:** $4.99/mo or $49.99/yr
- **Geofencing:** Yes — geo-fence sets precise tournament boundaries. Out-of-bound catches rejected automatically.
- **Offline:** Yes — submit/save locally, uploads when connectivity returns
- **Missing:** Tiny user base (15 ratings), no self-service tournament creation, no AI, no video

#### AINGLER — AI-First Disruptor
- **Rating:** 3.9/5 (42 ratings, iOS)
- **Pricing:** Pro: $8.99/mo (waives service fees)
- **AI:** AI-Powered Catch Verification, AI SnapLength (auto-estimates fish length). Working on measurement without bump board (announced ICAST 2025).
- **Geofencing:** Yes
- **Trust problem:** Users report "people winning money with fake catches of small fish labeled as 50 inches long." Developer disputed but trust gap is documented.
- **Missing:** AI verification not trusted yet, no video, small ecosystem

#### Others
- **iAngler:** 2.8/5, effectively dead. No GPS verification, persistent technical issues spanning years.
- **CatchStat:** 4.2/5 (6 ratings), offshore/pelagic focus, enterprise-priced. Video submission praised.
- **Reel LiveWell:** Basic tool, no GPS/anti-cheat/geofencing.

### 2.2 KBF (Kayak Bass Fishing) — The Governing Body

Uses Fishing Chaos as TMS. Not a technology company.

**2026 Verification Rules:**
- Photo format: CPRR (Catch-Photo-Record-Release)
- Mandatory: Official KBF Identifier Card (2026 edition), no handwritten IDs
- Approved boards: Ketch Products only (aluminum, Karbonate, X)
- Photo rules: Fish facing left, dorsal up, belly down, tail right, camera lens directly over center, watercraft visible, fence touching bass lip, closed mouth (half-inch penalty if open)
- EXIF data checked against eligible water boundaries and competition hours (after the fact, not real-time)
- Polygraph testing: Random selection. Refusal = immediate DQ + permanent ban.
- No guides within 14 days of event

### 2.3 Common Cheating Methods

1. Pre-caught fish (caught before tournament, stored)
2. Fish weighting (lead weights inserted into bodies)
3. Purchased catches (buying fish from other anglers)
4. Bump board manipulation (doctoring measuring devices or photo angles)
5. Photo alteration (editing timestamps, locations, images)
6. Camera roll recycling (submitting old photos as new)
7. Hidden compartments (pre-caught fish in kayak storage)
8. Boundary violations (fishing outside designated waters)

### 2.4 Competitive Landscape Matrix

| App | Rating | GPS | Geofence | AI Verify | Anti-Cheat | Offline | Video | Pricing Model |
|-----|--------|-----|----------|-----------|------------|---------|-------|---------------|
| TourneyX | 4.7 | Geotag | No | No | Manual + digital ID | No | No | $6.50/angler (director pays) |
| Fishing Chaos | 4.0 | Location | No | No | Manual judging | No | No | $3.99/mo or $43.89/yr |
| FishDonkey | 4.0 | GPS track | No | **Patented CPVR** | Patented | **Yes** | **Yes** | Free to host, angler service fee |
| eTournament | 4.3 | GPS map | **Yes** | No | Timestamp + geofence | **Yes** | No | $4.99/mo or $49.99/yr |
| AINGLER | 3.9 | Yes | **Yes** | **Yes** | AI-powered | **Yes** | No | $8.99/mo Pro |
| iAngler | 2.8 | No | No | No | None | No | No | Free |
| CatchStat | 4.2 | No | No | No | Manual | No | **Yes** | Enterprise/custom |

### 2.5 Gaps = KULL 1 Opportunities

1. **Real-time GPS boundary enforcement + AI photo verification combined.** Nobody does both in a single verified pipeline.
2. **Trustworthy AI measurement.** AINGLER's AI exists but anglers publicly report fake catches winning money. The trust gap is enormous.
3. **Modern payment processing.** TourneyX = PayPal only. Nobody offers Stripe Connect split payments with instant director payouts.
4. **Frictionless catch submission.** TourneyX's 10-minute upload process is the #1 complaint. Under 30 seconds wins anglers.
5. **Offline-first with sync.** Only FishDonkey and eTournament truly work offline. Critical for kayak fishing (no cell service).
6. **Video verification as standard.** Only FishDonkey and CatchStat support video. Making it standard dramatically reduces cheating.
7. **Transparent pricing.** Every platform hides or confuses pricing.
8. **Modern UX.** Most apps look like 2018-era development. FishDonkey hasn't been updated in 18 months.

### 2.6 Market Context

- Global fishing app market: $1.2B-$1.9B (2025), 10-12% CAGR
- 1,000+ fishing apps globally, top 2 hold ~20% of users
- 45% spike in DAU for social/gamified features
- FishDonkey: 171K registered anglers (largest tournament-specific user base)
- Fishing Chaos: Most institutional partnerships (Bass Pro, B.A.S.S., KBF)
- TourneyX: Highest user satisfaction (4.7 stars)

---

## Part 3: Stripe Connect — Tournament Marketplace Payments

### 3.1 Account Type: Express

Express is the correct choice. Standard gives directors too much control (full Stripe Dashboard, self-managed payouts). Custom requires building your own KYC/onboarding UI. Express gives programmatic payout control while Stripe handles all identity verification.

**Cost:** $2/mo per active connected account + payout fees.

**Legacy `type: "express"` still works** but Stripe now recommends `controller` properties. Equivalent: `controller.stripe_dashboard.type = "express"`.

### 3.2 Payment Flow: Separate Charges and Transfers (Recommended)

**Why not Destination Charges:** Only supports one connected account per charge. Can't split entry fees into prize pool + director payout + platform fee.

**Separate Charges and Transfers flow:**

```js
// Step 1: Charge the angler on platform account
const paymentIntent = await stripe.paymentIntents.create({
  amount: 10000,              // $100 entry fee (cents)
  currency: 'usd',
  automatic_payment_methods: { enabled: true },
  transfer_group: 'tournament_42',
});

// Step 2: After event ends, transfer to director
const transfer = await stripe.transfers.create({
  amount: 9500,               // $95 (minus $5 platform fee)
  currency: 'usd',
  destination: 'acct_DIRECTOR123',
  transfer_group: 'tournament_42',
  source_transaction: 'ch_CHARGE123',  // prevents transfer before charge settles
});
```

**Why this works for tournaments:**
- Platform holds funds until tournament completes (escrow)
- Can split one charge across multiple connected accounts (winners + director)
- Transfer timing decoupled from charge timing
- `transfer_group` links all related transactions for reconciliation

**CRITICAL:** Transfer request fails when amount exceeds platform's available balance. Use `source_transaction` to tie transfers to specific charges.

### 3.3 Prize Payouts to Winners

**You cannot transfer from one connected account to another.** Transfers only go platform -> connected account.

**Recommended: Platform Holds and Distributes (Escrow)**

```js
// Prize payout to 1st place
await stripe.transfers.create({
  amount: 50000, currency: 'usd',
  destination: 'acct_WINNER1',
  transfer_group: 'tournament_42',
});

// Prize payout to 2nd place
await stripe.transfers.create({
  amount: 25000, currency: 'usd',
  destination: 'acct_WINNER2',
  transfer_group: 'tournament_42',
});

// Remainder to director
await stripe.transfers.create({
  amount: 20000, currency: 'usd',
  destination: 'acct_DIRECTOR123',
  transfer_group: 'tournament_42',
});
```

**Winners must be Express connected accounts** to receive prize payouts via Stripe. Alternative: pay everything to director's account and let director distribute offline (simpler, less control).

**Payout scheduling:**
```js
// Set manual payouts for a connected account
await stripe.accounts.update('acct_WINNER1', {
  settings: { payouts: { schedule: { interval: 'manual' } } },
});
```

### 3.4 Onboarding Flow

```js
// 1. Create Express account
const account = await stripe.accounts.create({
  type: 'express',
  country: 'US',
  email: 'director@example.com',
  capabilities: {
    card_payments: { requested: true },
    transfers: { requested: true },
  },
});

// 2. Generate one-time onboarding link
const accountLink = await stripe.accountLinks.create({
  account: account.id,
  refresh_url: 'https://kull1.com/stripe/refresh',
  return_url: 'https://kull1.com/stripe/return',
  type: 'account_onboarding',
});
// Redirect user to accountLink.url

// 3. Check completion (return_url does NOT guarantee completion)
const acct = await stripe.accounts.retrieve(account.id);
// acct.details_submitted  — true if onboarding completed
// acct.charges_enabled    — true if can accept charges
// acct.payouts_enabled    — true if can receive payouts
```

Stripe collects all KYC during hosted onboarding: legal name, DOB, address, SSN (last 4 or full), EIN, bank account, government ID if needed. **You cannot read or update KYC info after account link creation** — Stripe owns that data.

### 3.5 Fee Math

**Standard processing:** 2.9% + $0.30 per card charge (US cards).

**Connect fees:**
- $2.00/mo per active connected account (active = payout sent that month)
- 0.25% + $0.25 per payout to connected account's bank
- Instant Payouts: 1% (settles in ~30 min)

**Example: $100 entry fee, $5 platform fee:**

| Item | Amount |
|------|--------|
| Stripe processing | $3.20 (2.9% + $0.30) |
| Platform fee | $5.00 |
| Net to platform after processing | $1.80 |
| Payout fee when transferring $95 to director | ~$0.49 (0.25% + $0.25) |
| Monthly active account fee | $2.00/director/month |

**The platform pays Stripe processing fees from its own balance** (separate charges model). On a $100 charge keeping $5, you eat the $3.20 processing. To fix: charge $105 total or adjust the platform fee to account for processing.

### 3.6 1099-K Tax Reporting

**Federal threshold (2026):** $20,000 gross volume AND 200+ transactions. The $600 threshold was permanently reversed by the "One Big Beautiful Bill Act" (July 4, 2025), retroactive to 2022.

**For KULL 1 with separate charges (platform pays Stripe fees):** Platform is responsible for filing 1099-K.

Stripe provides: tax reporting dashboard, W-9 collection during onboarding, form delivery to recipients. Filing deadline: January 22 recommended for IRS January 31 deadline.

**State thresholds vary.** MD, MA, VT, VA, DC have $600 thresholds regardless of federal rules.

### 3.7 Webhooks

**Two separate endpoints required:**
- `connect: false` — events on platform account (payments)
- `connect: true` — events on connected accounts (onboarding, payouts)

**Must-have events:**

| Event | Purpose |
|-------|---------|
| `payment_intent.succeeded` | Entry fee confirmed, credit tournament pool |
| `payment_intent.payment_failed` | Entry fee failed |
| `charge.refunded` | Angler refund processed |
| `account.updated` | Director onboarding progress, KYC changes |
| `account.application.deauthorized` | Director disconnected from platform |
| `payout.paid` | Funds deposited in bank |
| `payout.failed` | Bank rejected payout |
| `transfer.created` | Prize transfer initiated |
| `transfer.reversed` | Transfer reversed (failure) |

Connected account events include a top-level `account` property identifying which account triggered it.

### 3.8 Recommended Architecture

1. **Account type:** Express
2. **Charge type:** Separate Charges and Transfers (platform = escrow)
3. **Flow:** Angler pays entry -> platform balance -> tournament ends -> transfers to winners + director -> platform keeps fee
4. **Winners:** Must onboard as Express connected accounts for Stripe payouts (OR: pay everything to director, let director distribute offline)
5. **Tax:** Platform files 1099-K. Federal $20K + 200 transactions threshold. Consult tax advisor for state requirements.

---

## Sources

### Expo SDK
- [expo-location](https://docs.expo.dev/versions/latest/sdk/location/)
- [expo-camera](https://docs.expo.dev/versions/latest/sdk/camera/)
- [expo-image-manipulator](https://docs.expo.dev/versions/latest/sdk/imagemanipulator/)
- [expo-file-system](https://docs.expo.dev/versions/latest/sdk/filesystem/)
- [expo-notifications](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [expo-router](https://docs.expo.dev/router/basics/core-concepts/)
- [EAS Build](https://docs.expo.dev/build/setup/)
- [expo-background-task](https://docs.expo.dev/versions/latest/sdk/background-task/)
- [expo-task-manager](https://docs.expo.dev/versions/latest/sdk/task-manager/)
- [npx testflight](https://docs.expo.dev/build-reference/npx-testflight/)
- [GitHub #12077 — camera GPS EXIF](https://github.com/expo/expo/issues/12077)
- [GitHub #41037 — Android additionalExif](https://github.com/expo/expo/issues/41037)
- [GitHub #6726 — iOS vs Android compression](https://github.com/expo/expo/issues/6726)
- [GitHub #9570 — background location killed app](https://github.com/expo/expo/issues/9570)
- [transistorsoft polygon geofences](https://transistorsoft.github.io/react-native-background-geolocation/interfaces/geofence.html)
- [Expo SDK 55 Changelog](https://expo.dev/changelog/sdk-55-beta)

### Competitors
- [TourneyX Features](https://tourneyx.com/app/features/) | [Pricing](https://tourneyx.com/pricing) | [App Store](https://apps.apple.com/us/app/tourneyx-pro/id1478882171)
- [Fishing Chaos](https://www.fishingchaos.com/tournaments) | [App Store](https://apps.apple.com/us/app/fishing-chaos/id1494960277) | [Bass Pro Partnership](https://www.gameandfishmag.com/editorial/bass-pro-shops-fishing-chaos-pr/544548)
- [FishDonkey](https://www.fishdonkey.com/) | [App Store](https://apps.apple.com/us/app/fishdonkey/id1170550251)
- [eTournament Fishing](https://etournamentfishing.com/features) | [App Store](https://apps.apple.com/us/app/etournament-fishing/id1623026868)
- [AINGLER](https://www.aingler.ai/) | [App Store](https://apps.apple.com/us/app/aingler/id6504486193)
- [iAngler App Store](https://apps.apple.com/us/app/iangler-tournament/id872669180)
- [CatchStat App Store](https://apps.apple.com/us/app/catchstat/id1470488683)
- [Reel LiveWell](https://www.reellivewell.com/app-features/)
- [KBF Rules](https://www.kayakbassfishing.com/kbf-rules-standards/) | [KBF Identifier](https://kayakbassfishing.com/identifier/)
- [Fishing App Market Size](https://www.industryresearch.biz/market-reports/fishing-app-market-103636)

### Stripe Connect
- [Connect Account Types](https://docs.stripe.com/connect/accounts)
- [Express Accounts](https://docs.stripe.com/connect/express-accounts)
- [Separate Charges and Transfers](https://docs.stripe.com/connect/separate-charges-and-transfers)
- [Destination Charges](https://docs.stripe.com/connect/destination-charges)
- [Connect Webhooks](https://docs.stripe.com/connect/webhooks)
- [1099-K Requirements](https://docs.stripe.com/connect/1099-K)
- [Connect Pricing](https://stripe.com/connect/pricing)
- [Transfer API](https://docs.stripe.com/api/transfers/create)
- [PaymentIntent API](https://docs.stripe.com/api/payment_intents/create)
- [Account API](https://docs.stripe.com/api/accounts/create)
- [IRS 1099-K Threshold (OBBBA)](https://www.irs.gov/newsroom/irs-issues-faqs-on-form-1099-k-threshold-under-the-one-big-beautiful-bill-dollar-limit-reverts-to-20000)
