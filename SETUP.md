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

## 4. Projektstruktur verstehen

```
plantCare/
├── App.js                      # Haupt-Einstiegspunkt
├── src/
│   ├── components/             # Wiederverwendbare Komponenten
│   │   └── PlantCard.js
│   ├── screens/                # Bildschirme/Views
│   │   └── HomeScreen.js
│   └── utils/                  # Hilfsfunktionen
│       └── dateHelpers.js
└── assets/                     # Bilder, Icons, Fonts
```

## 5. Nächste Schritte

- [ ] Navigation hinzufügen mit React Navigation
- [ ] Weitere Bildschirme erstellen
- [ ] Backend-Integration
- [ ] State Management (Context API/Redux)
- [ ] Datenbank für Pflanzen

## Tipps

- Verwende `console.log()` für Debugging
- Shake-Geste auf dem Gerät öffnet das Entwicklermenü
- Live Reload ist standardmäßig aktiviert
- Bei Problemen: Cache löschen mit `expo start -c`

## Häufige Befehle

```bash
npm start              # Dev-Server starten
npm start -- --clear   # Mit Cache-Löschung
npm run android        # Android App starten
npm run ios            # iOS App starten
npm run web            # Web-Version starten
```

## Hilfe & Ressourcen

- [Expo Dokumentation](https://docs.expo.dev/)
- [React Native Dokumentation](https://reactnative.dev/)
- [React Navigation](https://reactnavigation.org/)
