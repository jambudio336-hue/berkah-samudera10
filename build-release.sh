#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
: "${ANDROID_HOME:=$HOME/android-sdk}"
export ANDROID_HOME
export ANDROID_SDK_ROOT="$ANDROID_HOME"
export JAVA_HOME="${JAVA_HOME:-/usr/lib/jvm/java-21-openjdk-amd64}"
: "${VERSION_NAME:=1.0.30}"
: "${VERSION_CODE:=10030}"

# Build www from the canonical source tree; never ship a stale partial copy.
rm -rf "$ROOT/www"
mkdir -p "$ROOT/www"
cp -a "$ROOT/index.html" "$ROOT/manifest.json" "$ROOT/sw.js" "$ROOT/icon.svg" "$ROOT/logo-berkahsamudera.svg" "$ROOT/www/"
find "$ROOT" -maxdepth 1 -type f \( -iname '*.png' -o -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.mp4' -o -iname '*.wav' \) -exec cp -a {} "$ROOT/www/" \;
cp -a "$ROOT/assets" "$ROOT/css" "$ROOT/js" "$ROOT/www/"

(cd "$ROOT" && npm ci && npx cap sync android)
printf 'sdk.dir=%s\n' "$ANDROID_HOME" > "$ROOT/android/local.properties"
(cd "$ROOT/android" && ./gradlew assembleRelease --no-daemon -PVERSION_NAME="$VERSION_NAME" -PVERSION_CODE="$VERSION_CODE")
APK="$ROOT/android/app/build/outputs/apk/release/app-release-unsigned.apk"
cp -f "$APK" "$ROOT/Berkah-Samudera10-release-unsigned.apk"
printf '\nUnsigned APK: %s\n' "$ROOT/Berkah-Samudera10-release-unsigned.apk"
