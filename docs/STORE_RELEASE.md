# Store release guide (App Store + Google Play)

This document covers everything needed to publish **Azure Pipeline 1.1.0**
(build 2). The JavaScript and native projects are already configured for
production; the remaining steps need your Apple/Google accounts and signing
secrets, which must never be committed.

## 1. What is already done in the repository

| Item | Status |
| --- | --- |
| React Native 0.88 / React 19.3 upgrade | done |
| Navigation upgraded to React Navigation 7 (native stack) | done |
| Unmaintained/unsafe dependencies removed (`base-64`, `ios`, `@react-native-community/masked-view`, reanimated, gesture-handler) | done |
| PAT moved from plain-text AsyncStorage to Keychain/Keystore | done |
| Legacy plain-text token cleanup on upgrade | done |
| HTTPS-only API client + 30 s timeout + no secret logging | done |
| Android broad storage permissions removed; artifacts use app-scoped cache + share sheet | done |
| Android cleartext HTTP disabled (debug allows localhost only) | done |
| Android backup/data-transfer excluded | done |
| iOS unused location permission removed | done |
| iOS privacy manifest present; no tracking, no data collection | done |
| App icons (iPhone, iPad, Android legacy + adaptive) | done |
| Version bumped to 1.1.0 (Android versionCode 2, iOS build 2) | done |
| Android target SDK 36 / compile SDK 37 | done |
| Android release signing via `keystore.properties` or env vars | done |
| R8 minification + resource shrinking in release | done |
| CI: audit, type-check, lint, tests, release AAB, iOS release build | done |

## 2. Before you upload

### 2.1 Create the Android upload key (once)

```bash
cd android
keytool -genkeypair -v \
  -storetype PKCS12 \
  -keystore upload-keystore.jks \
  -alias upload \
  -keyalg RSA -keysize 2048 -validity 10000
```

Create `android/keystore.properties` (gitignored):

```properties
storeFile=upload-keystore.jks
storePassword=********
keyAlias=upload
keyPassword=********
```

Back up the keystore and passwords. If you use Play App Signing, this is the
upload key; losing it requires a key reset request.

### 2.2 Build the Android App Bundle

```bash
npm ci
cd android
./gradlew bundleRelease
```

Output: `android/app/build/outputs/bundle/release/app-release.aab`.

Verify the signature:

```bash
jarsigner -verify -verbose -certs app/build/outputs/bundle/release/app-release.aab
```

### 2.3 Build the iOS archive

```bash
npm ci
cd ios && pod install && cd ..
open ios/AzurePipeline.xcworkspace
```

In Xcode:

1. Select the **AzurePipeline** target → **Signing & Capabilities**.
2. Choose your Apple Developer team; confirm bundle identifier
   `com.azurepipeline`.
3. Set the destination to **Any iOS Device (arm64)**.
4. **Product → Archive**.
5. In Organizer choose **Distribute App → App Store Connect → Upload**.

Alternatively, with an export options plist and signing identities:

```bash
cp ios/ExportOptions.plist.example ios/ExportOptions.plist
# edit teamID, then:
xcodebuild -workspace ios/AzurePipeline.xcworkspace \
  -scheme AzurePipeline \
  -configuration Release \
  -destination 'generic/platform=iOS' \
  -archivePath build/AzurePipeline.xcarchive \
  archive

xcodebuild -exportArchive \
  -archivePath build/AzurePipeline.xcarchive \
  -exportPath build/export \
  -exportOptionsPlist ios/ExportOptions.plist
```

## 3. Google Play Console checklist

1. **Create app**: name `Azure Pipeline`, default language, app (not game),
   free.
2. **App content**:
   - Privacy policy URL: link to `PRIVACY.md` published on GitHub (or your site).
   - Ads: **No ads**.
   - App access: choose **All or some functionality is restricted** and provide
     a working, read-only PAT plus organization name in the instructions.
     Reviewers cannot pass the login screen otherwise.
   - Content rating questionnaire: Developer tools / utility, no user-generated
     content.
   - Target audience: 18+ (developer tool).
   - Data safety: **No data collected or shared**. Data is encrypted in transit.
     Users can delete data by logging out or uninstalling. The developer has no
     server.
   - News app: No. COVID-19 app: No.
3. **Store listing**:
   - Short description and full description: see `docs/STORE_LISTING.md`.
   - App icon: `store-assets/play-store-icon-512.png`.
   - Feature graphic: `store-assets/play-feature-graphic-1024x500.png`.
   - Phone screenshots: at least 2 (see §5).
4. **Production → Create new release**: upload `app-release.aab`.
   - Play requires new apps and updates to target Android 16 (API 36) from
     August 2026; this project targets 36.
5. **Rollout**: start with an internal testing track, verify login/trigger/logs,
   then promote to production.

## 4. App Store Connect checklist

1. **Create the app record**: bundle ID `com.azurepipeline`, name
   `Azure Pipeline`, primary language, category **Developer Tools**.
2. **App information**:
   - Privacy policy URL: published `PRIVACY.md`.
   - Age rating: 4+ (no objectionable content).
3. **App Privacy**: answer **Data Not Collected** (no analytics, no tracking,
   credentials stay on-device; requests go directly to Azure DevOps).
4. **Export compliance**: already declared in `Info.plist`
   (`ITSAppUsesNonExemptEncryption = false`).
5. **Version information**:
   - Description/keywords/support URL: see `docs/STORE_LISTING.md`.
   - Screenshots: 6.9" iPhone is required; 6.5" and 13" iPad are recommended
     because the app supports iPad.
   - Build: select the uploaded build 2.
6. **App Review Information** (critical):
   - Sign-in required: **Yes**.
   - Provide an organization name and a long-lived, read-only PAT in the notes.
   - Add review notes explaining that the PAT is used like a password and that
     testers can view projects, pipelines, builds, logs and download artifacts.
   - Mention the app is an unofficial client and not affiliated with Microsoft.
7. **Submit for review**.

## 5. Screenshots

Screenshots must come from a real device/simulator because the app requires a
valid Azure DevOps login. Capture at minimum:

1. Login screen.
2. Projects/Apps list.
3. Pipelines list.
4. Builds list with the "Trigger Build" action.
5. Build monitor with task logs.
6. Artifacts with download/share.

Apple: 1290×2796 (6.9" iPhone) and 2048×2732 (iPad) if you ship iPad.
Google Play: 1080×1920+ PNG/JPEG, 2–8 images.

Save them under `store-assets/screenshots/` (gitignored or committed as you
prefer).

## 6. Version bump checklist for the next release

- `package.json` → `version`
- `android/app/build.gradle` → `versionCode` (+1) and `versionName`
- `ios/AzurePipeline.xcodeproj/project.pbxproj` →
  `CURRENT_PROJECT_VERSION` (+1) and `MARKETING_VERSION`
- `docs/STORE_LISTING.md` → "What's new" text
- Re-run `npm run typecheck && npm run lint && npm test`
- Rebuild both binaries

## 7. Trademark note

"Azure" and "Azure DevOps" are Microsoft trademarks. This is an unofficial
client; the store listing, screenshots and review notes must say so. If Apple or
Google rejects the name, rename the display name (for example
"Pipeline Mobile") while keeping the bundle identifiers unchanged.
