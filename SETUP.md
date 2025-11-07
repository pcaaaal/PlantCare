# Schnellstart-Anleitung

## 1. Projekt Setup

```bash
# Abhängigkeiten installieren
npm install

# Expo CLI global installieren (optional, aber empfohlen)
npm install -g expo-cli
```

## 2. Entwicklungsserver starten

```bash
npm start
```

Dies öffnet Expo Dev Tools in deinem Browser.

## 3. App auf dem Gerät testen

### Option A: Expo Go App (Empfohlen für Entwicklung)

1. Installiere die **Expo Go** App auf deinem Smartphone:
   - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)
   - [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. Scanne den QR-Code aus dem Terminal oder Browser mit:
   - **iOS**: Kamera-App
   - **Android**: Expo Go App

### Option B: Emulator/Simulator

**Android Emulator:**
```bash
npm run android
```

**iOS Simulator (nur macOS):**
```bash
npm run ios
```

### Option C: Web Browser
```bash
npm run web
```