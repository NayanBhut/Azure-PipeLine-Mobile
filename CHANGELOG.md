# Changelog

## 1.1.0 — build 2

### Upgrades
- React Native 0.76 → 0.88 (new architecture, Hermes).
- React 18.3 → 19.3, React Navigation 6 → 7 with the native stack.
- Android compile SDK 37 / target SDK 36, build tools 37, Kotlin 2.2,
  Gradle 9.4.1, iOS minimum 15.1.
- AsyncStorage 2 → 3, screens 4.30, safe-area-context 5.10.
- Replaced the unmaintained JS stack dependencies with the native stack;
  removed `base-64`, `ios`, `@react-native-community/masked-view`,
  `react-native-gesture-handler` and `react-native-reanimated`.
- `react-native-fs` stays at 2.20.0 (the latest published release) and is only
  used to download artifacts into app-scoped storage.

### Security
- Azure DevOps personal access tokens are stored in the iOS Keychain /
  Android Keystore-backed storage with `WHEN_UNLOCKED_THIS_DEVICE_ONLY`.
- Removed plain-text `token` and `username:token` (`uid`) AsyncStorage entries;
  legacy values are deleted on first launch after upgrading.
- Added an Azure DevOps host allow-list and HTTPS-only enforcement, request
  timeouts, and removal of endpoint/token logging.
- Added input validation for organization names, tokens and artifact file
  names; artifact downloads only send the token to Azure DevOps hosts.
- Android: removed `MANAGE_EXTERNAL_STORAGE`, `READ/WRITE_EXTERNAL_STORAGE` and
  unused biometric permissions from the merged manifest; disabled cleartext
  HTTP, backups and device-to-device transfer.
- iOS: removed the empty location usage description; added the privacy
  manifest and export-compliance declaration.
- Release signing now uses a private upload key from `keystore.properties` or
  environment variables instead of the debug key; R8 and resource shrinking
  enabled.
- CI hardened with read-only permissions, `npm ci`, `npm audit`, type-check,
  lint and tests.

### Store readiness
- App icons for iPhone, iPad and Android (legacy + adaptive), plus Play Store
  icon and feature graphic.
- Version 1.1.0 / versionCode 2 / iOS build 2, display name "Azure Pipeline".
- Privacy policy, security policy, store listing copy and a full release guide.
- Builds verified: Android release App Bundle, iOS Debug and Release simulator
  builds, Jest tests, TypeScript and ESLint.
