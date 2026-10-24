# Azure-Pipeline-Mobile

[![CI](https://github.com/NayanBhut/Azure-PipeLine-Mobile/actions/workflows/CreateBuild.yml/badge.svg?branch=main)](https://github.com/NayanBhut/Azure-PipeLine-Mobile/actions/workflows/CreateBuild.yml)

Unofficial Azure DevOps client for Android and iOS, built with React Native.

> Not affiliated with, endorsed by, or sponsored by Microsoft. "Azure" and
> "Azure DevOps" are trademarks of Microsoft Corporation.

## Features

- ✅ Login and logout to switch users
  ([create a PAT](https://learn.microsoft.com/en-us/azure/devops/organizations/accounts/use-personal-access-tokens-to-authenticate?view=azure-devops&tabs=Windows#create-a-pat))
- ✅ Project/app list with search and pagination
- ✅ Pipelines per project
- ✅ Build history per pipeline
- ✅ Trigger builds with repository + branch selection and template parameters
- ✅ Task-level build monitoring and full logs
- ✅ Download artifacts and export them with the system share sheet

## Security

- Personal access tokens are stored in the **iOS Keychain** / **Android
  Keystore-backed encrypted storage** through `react-native-keychain` — never in
  AsyncStorage or logs.
- On upgrade, credentials saved in plain text by older versions are deleted; you
  sign in once more so the token moves to secure storage.
- The API client accepts **HTTPS only**, applies a 30-second timeout, and does not
  log request URLs or authorization headers.
- Android requests only `INTERNET`; broad storage permissions were removed.
  Cleartext HTTP is disabled in release builds. Backups are excluded.
- User input is validated before being interpolated into URLs, headers and file
  paths.

See [`SECURITY.md`](SECURITY.md) and [`PRIVACY.md`](PRIVACY.md).

## Requirements

- Node.js 22.11+ (`.nvmrc` provided)
- JDK 17, Android SDK with platform 37 / build-tools 37.0.0
- Xcode 16.1+ and CocoaPods 1.13+ for iOS

## Setup

```bash
npm ci
```

### Android

```bash
npm run android
```

### iOS

```bash
cd ios && pod install && cd ..
npm run ios
```

## Quality checks

```bash
npm run typecheck   # TypeScript
npm run lint        # ESLint
npm test            # Jest (navigation smoke test + security unit tests)
npm audit --omit=dev --audit-level=high
```

CI runs all of the above plus a signed-with-throwaway-key Android App Bundle and
an unsigned iOS Release build.

## Release builds

- Android: `cd android && ./gradlew bundleRelease` → `app-release.aab`
- iOS: open `ios/AzurePipeline.xcworkspace`, set your team, then
  **Product → Archive**

Upload signing is read from `android/keystore.properties` (gitignored) or
`ANDROID_KEYSTORE_PATH`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`,
`ANDROID_KEY_PASSWORD`. Store-ready assets are in
[`store-assets/`](store-assets/). The full checklist — including Play data safety
answers and App Review notes for the login-required flow — is in
[`docs/STORE_RELEASE.md`](docs/STORE_RELEASE.md).

## Project structure

```
src/
  APICall/        Azure DevOps REST client, endpoints and response models
  Common/         UI building blocks, secure storage, validation, base64
  navigation/     Shared typed navigation contract
  screens/        Login, projects, pipelines, builds, build monitor, artifacts
__tests__/        Jest unit and render tests
docs/             Store release and listing documentation
store-assets/     Store icons and feature graphic
```

## Disclaimer

This project is an independent, community-built client. Microsoft does not
provide support for it. Use a least-privilege personal access token and revoke it
if a device is lost.
