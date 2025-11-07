# Development Guidelines

## Code-Stil

### JavaScript/React Native
- Verwende funktionale Komponenten mit Hooks
- Nutze `const` für Konstanten, `let` für Variablen
- Benenne Komponenten in PascalCase
- Benenne Funktionen und Variablen in camelCase
- Verwende aussagekräftige Namen

### Komponenten-Struktur
```javascript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ComponentName({ prop1, prop2 }) {
  return (
    <View style={styles.container}>
      <Text>{prop1}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // styles hier
  },
});
```

### Ordnerstruktur
```
src/
├── components/     # Wiederverwendbare UI-Komponenten
├── screens/        # Vollständige Bildschirme
├── navigation/     # Navigation-Konfiguration
├── services/       # API-Calls und externe Services
├── utils/          # Hilfsfunktionen
├── hooks/          # Custom React Hooks
├── context/        # React Context für State Management
└── constants/      # Konstanten (Farben, Sizes, etc.)
```

## Best Practices

### Performance
- Verwende `React.memo()` für teure Komponenten
- Nutze `useCallback` und `useMemo` wo sinnvoll
- Vermeide inline Funktionen in render-Listen
- Optimiere Bilder mit `react-native-fast-image`

### State Management
- Lokaler State: `useState` für Komponenten-State
- Geteilter State: React Context oder Redux
- Server State: React Query oder SWR

### Styling
- Verwende StyleSheet.create() für Styles
- Definiere Farben und Größen als Konstanten
- Nutze Flexbox für Layouts
- Teste auf verschiedenen Bildschirmgrößen

### Error Handling
```javascript
try {
  // Code der fehlschlagen könnte
} catch (error) {
  console.error('Error:', error);
  // User-freundliche Fehlermeldung anzeigen
}
```

## Testing

### Unit Tests (optional)
```bash
npm install --save-dev jest @testing-library/react-native
```

### E2E Tests (optional)
```bash
npm install --save-dev detox
```

## Git Workflow

1. Erstelle einen Feature-Branch: `git checkout -b feature/neue-funktion`
2. Mache kleine, fokussierte Commits
3. Schreibe aussagekräftige Commit-Messages
4. Erstelle einen Pull Request
5. Code Review abwarten
6. Merge nach Approval

## Debugging

### React Native Debugger
- Shake-Geste auf dem Gerät
- Wähle "Debug" aus dem Menü
- Chrome DevTools öffnen sich

### Logs
```javascript
console.log('Debug info:', variable);
console.warn('Warning:', message);
console.error('Error:', error);
```

### Expo Debugging
```bash
# Mit Cache-Löschung
expo start -c

# Verbose Logging
expo start --verbose
```

## Hilfreiches

### Häufige Komponenten
- View: Container
- Text: Text-Anzeige
- ScrollView: Scrollbare Inhalte
- FlatList: Optimierte Listen
- TextInput: Eingabefelder
- TouchableOpacity: Buttons
- Image: Bilder

### Hooks
- useState: Lokaler State
- useEffect: Side Effects
- useContext: Context zugreifen
- useRef: Refs verwalten
- useMemo: Werte memoizen
- useCallback: Funktionen memoizen

## Ressourcen

- [React Native Docs](https://reactnative.dev/)
- [Expo Docs](https://docs.expo.dev/)
- [React Hooks](https://react.dev/reference/react)
