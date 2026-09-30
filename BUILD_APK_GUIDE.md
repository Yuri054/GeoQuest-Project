# RealmQuest: England Map Quiz — Android APK Compilation Guide

This repository contains the full source code for the **RealmQuest England Map Quiz Android App**, pre-configured with **Capacitor 8** and **Progressive Web App (WebAPK)** tooling.

---

## Method 1: Build Native Android APK using Capacitor (Recommended)

### Prerequisites
1. **Node.js** 18+ and **npm**
2. **Android Studio** (or Android SDK command line tools with JDK 17+)

### Step-by-Step Build Commands

```bash
# 1. Build the production web bundle
npm run build

# 2. Add the native Android project (run once)
npx cap add android

# 3. Synchronize web assets and plugins to Android
npx cap sync android

# 4. Compile the standalone debug APK via Gradle
cd android
./gradlew assembleDebug
```

### Where to Find Your APK
After running the Gradle command above, your compiled APK is generated at:
```
android/app/build/outputs/apk/debug/app-debug.apk
```
You can transfer this `.apk` file directly to any Android smartphone via USB, Google Drive, or messaging apps, tap to install, and play immediately offline!

### Building a Release (Signed) APK
To generate a production-signed APK ready for distribution or the Google Play Store:
```bash
cd android
./gradlew assembleRelease
```
The output file will be at:
```
android/app/build/outputs/apk/release/app-release-unsigned.apk
```
(Sign with `apksigner` and your keystore).

---

## Method 2: Open and Run Directly in Android Studio

If you prefer testing on an Android Emulator or directly plugged-in Android device with USB debugging:
```bash
npm run build
npx cap sync android
npx cap open android
```
In Android Studio:
1. Click the green **Run** ▶ button.
2. Select your connected Android phone or an Android Virtual Device (AVD).

---

## Method 3: Instant 1-Tap Android WebAPK (Zero SDK Required)

Android Chrome supports WebAPK generation out of the box through Google Play Services:
1. Open the hosted web application URL in **Google Chrome** on any Android device.
2. Tap the in-app **"Install APK"** button or Chrome's three dots menu (⋮) -> **"Install app"**.
3. Android will automatically package and install a real standalone APK onto your home screen and app drawer with full offline support!

---

## Application Modules & Game Features
- **Entirety of England**: All ceremonial counties with vector boundaries.
- **Filtered Subsets by Region**:
  - Northern England (North East, North West, Yorkshire)
  - The Midlands (East & West Midlands)
  - East of England (Norfolk, Suffolk, Essex, Cambridgeshire, etc.)
  - South East & London (Greater London, Kent, Surrey, Sussex, Hampshire, etc.)
  - South West (Cornwall, Devon, Somerset, Dorset, Wiltshire, Gloucestershire, Bristol)
- **Major Towns & Cities**: London, Birmingham, Manchester, Leeds, Liverpool, Newcastle, Sheffield, Bristol, and 20+ more.
- **Seterra Scoring Rules**:
  - 1st attempt: 100% (Green)
  - 2nd attempt: 66% (Yellow)
  - 3rd attempt: 33% (Orange)
  - 3 misses: Auto-reveals (Red)
- **Audio & Haptics**: Native Web Audio sound synthesis + Android device vibration feedback.
- **Interactive Modes**: Pin Quiz (locate), Explore & Learn (trivia/population), Multiple Choice.
