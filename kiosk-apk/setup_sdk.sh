#!/bin/bash
set -e
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-arm64
export ANDROID_HOME=/opt/android-sdk
export ANDROID_SDK_ROOT=/opt/android-sdk
export PATH=$JAVA_HOME/bin:$PATH

sudo mkdir -p $ANDROID_HOME/cmdline-tools
cd /tmp
echo "== downloading cmdline-tools =="
curl -sSL -o cmdtools.zip "https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip"
echo "== unzipping =="
rm -rf /tmp/cmdline-tools
unzip -q cmdtools.zip -d /tmp
sudo rm -rf $ANDROID_HOME/cmdline-tools/latest
sudo mv /tmp/cmdline-tools $ANDROID_HOME/cmdline-tools/latest
sudo chown -R $(whoami) $ANDROID_HOME
SDKM=$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager
echo "== accepting licenses =="
yes | $SDKM --licenses >/dev/null 2>&1 || true
echo "== installing packages =="
$SDKM "platform-tools" "platforms;android-34" "build-tools;34.0.0" 2>&1 | tail -5
echo "SDK_SETUP_DONE"
