# Background Tracking and Automatic Updates

## Background tracking
Marine OS uses an Android location foreground service. The user explicitly starts 24/7 tracking and grants the required location permissions. The tracking preference is persisted, and a boot/package-replaced receiver can restart the location service after reboot or an app replacement when Android allows it.

Android still controls battery and background execution. Vendor power managers can throttle or stop work, so the app must show the last known position and its timestamp instead of pretending that tracking is guaranteed under every device policy.

## Updates

### Google Play
When the app is distributed through Google Play, the Android Play In-App Update library is enabled. Google Play manages the download and installation flow, and the Play Store can also perform normal automatic updates according to the user's Play settings.

### Direct APK / GitHub Release
The app checks the latest public GitHub Release on app start and periodically in the background. The expected asset name is:

berkah-samudera10-release.apk

For a direct APK update, the new APK MUST use the same signing certificate as the installed APK. The normal Android consumer installer may require one-time permission to install from this source and may require user confirmation. A normal third-party APK cannot silently replace itself.

### Release signing secrets
GitHub Actions should have these repository secrets:

MARINE_KEYSTORE_B64
MARINE_KEYSTORE_PASSWORD
MARINE_KEY_ALIAS
MARINE_KEY_PASSWORD

Never commit the private keystore or passwords.

Create a release by pushing a tag such as v1.0.20. The release workflow calculates Android versionCode as major*10000 + minor*100 + patch, signs the APK, verifies the signature, and publishes the expected release asset.

If signing secrets are missing, the release job is skipped so an unsigned APK is never published as a production update.

## Important limitation
The app can automate checking, downloading, notifying, and — for Google Play — managed installation. Silent self-installation of arbitrary consumer APKs is restricted by Android. Device-owner/managed-device scenarios are different and are not assumed here.
