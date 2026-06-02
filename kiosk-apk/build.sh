#!/bin/bash
set -e
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-arm64
export ANDROID_HOME=/opt/android-sdk
export ANDROID_SDK_ROOT=/opt/android-sdk
export PATH=$JAVA_HOME/bin:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$PATH
cd "$(dirname "$0")"
echo "Building APK..."
cd android && ./gradlew assembleDebug --no-daemon -q
echo "APK built: $(pwd)/app/build/outputs/apk/debug/app-debug.apk"
