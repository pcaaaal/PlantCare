# PlantCare 🌿

PlantCare: Die App, die deiner Pflanze erzählt, sie sei ein WLAN-Router. Sie misst Blatt-Launen, sendet Wurzelhoroskope und erinnert dich mit „Gieß mich vielleicht… oder nicht." Einmal tippen, zweimal verwirren. Funktioniert nur, wenn die Pflanze zustimmt. 🌿🤪

## React Native Expo App

Dies ist eine mobile App für die Pflanzenpflege, entwickelt mit React Native und Expo.

## Features

### ✅ Implemented Features

- **Plant Management**: Add, view, edit, and delete plants
- **Camera Integration**: Take photos of your plants using device camera
- **Image Picker**: Select photos from device gallery
- **Plant Database**: Pre-populated with common plants and their care requirements
- **Task Management**: Automatic watering task creation based on plant requirements
- **Task Tracking**: View upcoming tasks sorted by due date
- **Notifications**: Receive reminders when plants need watering
- **Data Persistence**: All data stored locally using AsyncStorage
- **Navigation**: Bottom tab navigation (Home, Add, Profile)
- **Plant Details**: View plant information, tasks, and care instructions

### 🎨 Screens

1. **Home Screen**: Displays plant carousel and upcoming tasks
2. **Add Plant Screen**: Camera integration with plant search and selection
3. **Plant Detail Screen**: Shows plant image, calendar view, tasks, and information
4. **Profile Screen**: View statistics and manage app data

## Voraussetzungen

- Node.js (v20 oder höher)
- npm oder yarn
- Expo Go App auf deinem Smartphone (für Live-Testing)

## Installation

1. Klone das Repository:
```bash
git clone https://github.com/Kenji839/plantCare.git
cd plantCare
```

2. Installiere die Abhängigkeiten:
```bash
npm install
```

## Entwicklung

### App starten

```bash
npm start
```

Dies öffnet den Expo Developer Tools. Du kannst die App dann auf verschiedenen Plattformen testen:

- **iOS**: Drücke `i` oder scanne den QR-Code mit der Expo Go App
- **Android**: Drücke `a` oder scanne den QR-Code mit der Expo Go App
- **Web**: Drücke `w` um die App im Browser zu öffnen

### Verfügbare Scripts

- `npm start` - Startet den Expo Development Server
- `npm run android` - Startet die App auf Android
- `npm run ios` - Startet die App auf iOS (nur macOS)
- `npm run web` - Startet die App im Browser

## Projektstruktur

```
plantCare/
├── App.js                      # Hauptkomponente mit Navigation
├── app.json                    # Expo-Konfiguration
├── package.json                # npm-Abhängigkeiten
├── babel.config.js             # Babel-Konfiguration
├── assets/                     # Bilder, Icons, etc.
├── src/
│   ├── components/             # Wiederverwendbare Komponenten
│   │   └── PlantCard.js        # Pflanzenkarte Komponente
│   ├── screens/                # App-Bildschirme
│   │   ├── HomeScreen.js       # Startseite mit Pflanzen und Tasks
│   │   ├── AddPlantScreen.js   # Pflanze hinzufügen mit Kamera
│   │   ├── PlantDetailScreen.js # Pflanzendetails und Tasks
│   │   └── ProfileScreen.js    # Profil und Einstellungen
│   ├── context/                # React Context für State Management
│   │   └── PlantContext.js     # Plant und Task Management
│   ├── services/               # Services für externe Funktionalität
│   │   ├── storageService.js   # AsyncStorage Wrapper
│   │   └── notificationService.js # Notification Management
│   ├── data/                   # Statische Daten
│   │   └── plantData.js        # Pflanzendatenbank
│   └── utils/                  # Hilfsfunktionen
│       └── dateHelpers.js      # Datum-Hilfsfunktionen
└── README.md
```

## Technologie-Stack

- **React Native**: Framework für mobile Apps
- **Expo**: Entwicklungsplattform für React Native
- **React Navigation**: Navigation zwischen Screens
- **AsyncStorage**: Lokale Datenspeicherung
- **Expo Camera**: Kamera-Integration
- **Expo Image Picker**: Bildauswahl aus Galerie
- **Expo Notifications**: Push-Benachrichtigungen
- **JavaScript/ES6+**: Programmiersprache

## Datenmodell

### Plant Object
```javascript
{
  id: number,
  name: string,
  scientificName: string[],
  watering: string,
  wateringGeneralBenchmark: { value: string, unit: string },
  sunlight: string[],
  description: string,
  imageUri: string,
  createdAt: string (ISO date),
}
```

### Task Object
```javascript
{
  id: number,
  plantId: number,
  type: string, // 'Water', 'Light', 'Prune'
  title: string,
  createdAt: string (ISO date),
  lastCompletedAt: string (ISO date),
  nextDueDate: string (ISO date),
  repeatInterval: { value: number, unit: string },
}
```

## Permissions

Die App benötigt folgende Berechtigungen:

- **Kamera**: Zum Fotografieren von Pflanzen
- **Foto-Bibliothek**: Zum Auswählen von Bildern
- **Benachrichtigungen**: Für Gießerinnerungen

## Beitragen

Contributions sind willkommen! Bitte erstelle einen Pull Request.

## Lizenz

Siehe LICENSE Datei für Details.
