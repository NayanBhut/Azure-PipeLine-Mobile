# Security Policy

## Reporting a vulnerability

Please **do not open a public issue** for security problems. Report them privately
through GitHub's "Report a vulnerability" advisory flow on this repository, or
contact the maintainer through GitHub. Include steps to reproduce and the app
version/build number. We aim to acknowledge reports within 5 working days.

## How credentials are handled

- The Azure DevOps personal access token (PAT) is stored in the iOS Keychain
  (`AccessibleWhenUnlockedThisDeviceOnly`, never migrated to another device) and
  in Android Keystore-backed encrypted storage.
- Tokens are never written to AsyncStorage, logs, analytics, crash reports, or
  source control.
- Older app versions stored the token and `username:token` in plain-text
  AsyncStorage. On first launch after upgrading, those legacy keys are deleted;
  sign in once more so the token is moved to secure storage.
- Only `https://` endpoints are accepted by the API client. Cleartext HTTP is
  disabled in release builds, including on Android through a network security
  config.
- User-supplied organization names and tokens are validated before being used in
  URLs/headers. Artifact names are sanitized before being used as file paths.

## Personal access token guidance

Create a PAT with the **minimum required scopes** (typically `Build (read)` and
optionally `Build (read & execute)` if you trigger builds, plus `Project and Team
(read)`). Set the shortest practical expiry, and revoke the token in Azure DevOps
if the device is lost. The app never asks for your Microsoft account password.

## Dependency and release security

- `npm audit --omit=dev --audit-level=high` runs in CI on every push/PR.
- GitHub Actions workflows request read-only repository permissions.
- Store builds must be signed with a private upload key that is never committed.
  See [`docs/STORE_RELEASE.md`](docs/STORE_RELEASE.md).
- The Android release build enables R8 minification and resource shrinking.
- iOS declares `ITSAppUsesNonExemptEncryption = false`; only standard HTTPS is
  used.

## Supported versions

Only the latest released version receives security fixes.
