#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
: "${ANDROID_HOME:=$HOME/android-sdk}"
export ANDROID_HOME
export ANDROID_SDK_ROOT="$ANDROID_HOME"
export JAVA_HOME="${JAVA_HOME:-/usr/lib/jvm/java-21-openjdk-amd64}"
rm -rf "$ROOT/www" && mkdir "$ROOT/www"
cp "$ROOT"/{index.html,manifest.json,sw.js,icon.svg} "$ROOT"/*.{png,jpg,mp4} "$ROOT/www/"
cp -r "$ROOT/css" "$ROOT/js" "$ROOT/www/"
(cd "$ROOT" && npx cap sync android)
printf 'sdk.dir=%s\n' "$ANDROID_HOME" > "$ROOT/android/local.properties"
(cd "$ROOT/android" && ./gradlew assembleRelease --no-daemon)
printf '\nUnsigned APK: %s\n' "$ROOT/android/app/build/outputs/apk/release/app-release-unsigned.apk"
