# Privacy Policy — Azure Pipeline (unofficial)

**Last updated:** 24 October 2026

Azure Pipeline is an unofficial, open-source mobile client for Azure DevOps. It
is not affiliated with, endorsed by, or sponsored by Microsoft.

## Summary

The app does not collect, transmit, or sell personal data to the developer or to
any third party. There are no analytics, advertising, tracking, or crash-reporting
SDKs in the app.

## Data the app handles

| Data | Where it is stored | Why |
| --- | --- | --- |
| Azure DevOps organization name | On-device app storage (AsyncStorage) | To reopen the last organization |
| Username (optional, display only) | On-device app storage (AsyncStorage) | Pre-fill the login form |
| Personal access token (PAT) | iOS Keychain / Android Keystore-backed encrypted storage | To authenticate requests to Azure DevOps |
| Projects, pipelines, builds, logs and artifacts | Fetched on demand; not stored by the developer | To display the requested information |
| Downloaded artifacts | App-scoped cache directory | Temporary; exported only when you choose Share/Save |

Your organization name and personal access token are sent only to
`https://dev.azure.com` as part of requests made on your behalf. All traffic uses
HTTPS and the app refuses non-HTTPS endpoints. The token is never written to
plain-text storage or logs.

## Retention and deletion

- **Logout** removes the token from the Keychain/Keystore and clears the stored
  organization/username.
- **Uninstalling the app** removes all local app data.
- The developer has no server and therefore holds no copy of your data.

## Permissions

- **Internet** — required to reach Azure DevOps.
- The app does not request location, contacts, camera, microphone, photos, or
  broad storage access.

## Children

The app is a developer tool and is not directed at children under 13.

## Changes

Material changes to this policy will be published in this file with a new
"last updated" date.

## Contact

Open an issue at
<https://github.com/NayanBhut/Azure-PipeLine-Mobile/issues> or contact the
repository owner through GitHub.
