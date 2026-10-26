# Store listing copy

## App name

Azure Pipeline (unofficial)

## Subtitle (App Store, 30 chars)

Azure DevOps builds on the go

## Short description (Google Play, 80 chars)

Unofficial Azure DevOps client: projects, pipelines, builds, logs, artifacts.

## Promotional text (App Store, 170 chars)

Check pipeline status, trigger builds with a branch and template parameters,
follow live task logs, and download artifacts — without opening a laptop.

## Full description

Azure Pipeline is an unofficial mobile client for Azure DevOps. Stay on top of
your CI/CD pipelines from your phone or tablet.

Features:
• Sign in with an Azure DevOps personal access token — stored securely in the
  device Keychain/Keystore, never in plain text.
• Browse your organizations, projects, pipelines and build history.
• Trigger builds for Azure Repos and external repositories, choose a branch and
  pass template parameters.
• Follow build progress with task-level status and full logs.
• Download build artifacts and save or share them with other apps.
• Lightweight, no ads, no analytics, no tracking.

Requirements:
• An Azure DevOps organization and a personal access token. Create a
  least-privilege token (Build read, optionally Build read & execute, Project and
  Team read) at https://dev.azure.com.
• HTTPS connectivity to dev.azure.com.

Privacy: the app talks directly to Azure DevOps. Your token stays on your device.
Read the full policy: <privacy policy URL>.

This app is not affiliated with, endorsed by, or sponsored by Microsoft. Azure
and Azure DevOps are trademarks of Microsoft Corporation.

## Keywords (App Store, 100 chars)

azure,devops,pipeline,build,ci,cd,logs,artifacts,developer,git,yaml,release

## Category

- App Store: Developer Tools
- Google Play: Tools / Developer tools

## Support URL

https://github.com/NayanBhut/Azure-PipeLine-Mobile

## Privacy policy URL

Publish `PRIVACY.md` and use that URL (for example the GitHub blob URL or a
GitHub Pages page).

## What's new (1.1.0)

• Rebuilt on React Native 0.88 with the latest navigation stack.
• Security: personal access tokens now live in the iOS Keychain / Android
  Keystore instead of plain-text storage; legacy tokens are removed.
• HTTPS-only networking, request timeouts, and no credential logging.
• Artifacts download to app storage and can be saved/shared via the system
  share sheet — no broad storage permission required.
• Removed unused permissions, added app icons and privacy manifest, and updated
  to Android 16 (API 36) requirements.
• Smaller, minified Android release builds.
