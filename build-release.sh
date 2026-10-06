#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
: "${VERSION_NAME:=1.1.0}"
: "${VERSION_CODE:=10100}"

if [[ -z "${ANDROID_HOME:-${ANDROID_SDK_ROOT:-}}" ]]; then
  for candidate in "$HOME/Android/Sdk" "$HOME/android-sdk" /opt/android-sdk; do
    if [[ -d "$candidate" ]]; then ANDROID_HOME="$candidate"; break; fi
  done
fi
ANDROID_HOME="${ANDROID_HOME:-${ANDROID_SDK_ROOT:-}}"
if [[ -z "$ANDROID_HOME" || ! -d "$ANDROID_HOME" ]]; then
  echo "Android SDK not found. Set ANDROID_HOME/ANDROID_SDK_ROOT or run the GitHub Actions release workflow." >&2
  exit 2
fi
export ANDROID_HOME ANDROID_SDK_ROOT="$ANDROID_HOME"
export JAVA_HOME="${JAVA_HOME:-/usr/lib/jvm/java-21-openjdk-amd64}"

cd "$ROOT"
npm ci --no-audit --no-fund
npm run build:web
npm test
npx cap sync android
printf 'sdk.dir=%s\n' "$ANDROID_HOME" > "$ROOT/android/local.properties"
(cd "$ROOT/android" && ./gradlew assembleRelease --no-daemon -PVERSION_NAME="$VERSION_NAME" -PVERSION_CODE="$VERSION_CODE")
APK="$ROOT/android/app/build/outputs/apk/release/app-release-unsigned.apk"
if [[ -f "$ROOT/android/marine-release.keystore" && -n "${STORE_PASSWORD:-}" && -n "${KEY_ALIAS:-}" && -n "${KEY_PASSWORD:-}" ]]; then
  SIGNED="$ROOT/Berkah-Samudera10-release.apk"
  "$ANDROID_HOME/build-tools/35.0.0/apksigner" sign --ks "$ROOT/android/marine-release.keystore" --ks-pass "pass:$STORE_PASSWORD" --ks-key-alias "$KEY_ALIAS" --key-pass "pass:$KEY_PASSWORD" --out "$SIGNED" "$APK"
  "$ANDROID_HOME/build-tools/35.0.0/apksigner" verify --verbose "$SIGNED" >/dev/null
  printf '\nSigned APK: %s\n' "$SIGNED"
else
  cp -f "$APK" "$ROOT/Berkah-Samudera10-release-unsigned.apk"
  printf '\nUnsigned APK (not suitable for seamless upgrades): %s\n' "$ROOT/Berkah-Samudera10-release-unsigned.apk"
fi
