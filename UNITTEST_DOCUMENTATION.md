# CopilotUnittest2 - Dokumentation und Lernerkenntnisse

## Übersicht

Diese Dokumentation beschreibt die erstellten Unit Tests für das PlantCare-Projekt und fasst die wichtigsten Lernerkenntnisse zusammen.

## Getestete Klasse: plantApiService

Die `plantApiService` Klasse wurde für umfassende Unit Tests ausgewählt, da sie:
- Mehrere Methoden mit Parameterübergaben und Rückgabewerten enthält
- Externe API-Aufrufe durchführt (ideal für Mocking)
- Verschiedene Edge Cases und Fehlerzustände aufweist
- Geschäftslogik wie Filterung und Datenformatierung implementiert

## Teststruktur

### Datei: `src/services/__tests__/CopilotUnittest2.test.js`

### Getestete Methoden

1. **searchPlants(query, page)**
   - Parameter: `query` (string), `page` (number, optional)
   - Rückgabewert: Promise<Array> von Pflanzenobjekten
   - 8 Tests implementiert

2. **getPlantDetails(plantId)**
   - Parameter: `plantId` (number)
   - Rückgabewert: Promise<Object> mit Pflanzendetails
   - 11 Tests implementiert

3. **Mock-Verifikation**
   - 4 zusätzliche Tests zur Überprüfung der Mock-Interaktionen

## Mock Framework: Jest

Das Projekt verwendet **Jest** als Testing- und Mocking-Framework. Jest bietet:
- Integrierte Mocking-Funktionalität ohne zusätzliche Bibliotheken
- `jest.fn()` für Function Mocks
- `jest.mock()` für Module Mocks
- Spy-Funktionalität mit `jest.spyOn()`
- Assertions mit `expect()` und Matchers

### Verwendete Mock-Techniken

```javascript
// 1. Global fetch function mocken
global.fetch = jest.fn();

// 2. Expo-Constants Modul mocken
jest.mock('expo-constants', () => ({
  expoConfig: {
    extra: {
      perenualApiKey: 'test-api-key',
      perenualApiUrl: 'https://test-api.com',
    },
  },
}));

// 3. Console-Methoden mocken (um Output zu unterdrücken)
jest.spyOn(console, 'log').mockImplementation(() => {});

// 4. Mock-Rückgabewerte definieren
fetch.mockResolvedValueOnce({
  ok: true,
  json: async () => mockResponse,
});
```

## Testabdeckung

### Normale Fälle (Happy Path)
- ✅ Erfolgreiche API-Aufrufe mit validen Daten
- ✅ Korrekte Datenformatierung und -transformation
- ✅ Mehrere Pflanzen in Suchergebnissen

### Grenzwerte (Boundary Cases)
- ✅ Leere Query-Strings
- ✅ Whitespace-only Queries
- ✅ Plant ID = 0 (falsy value)
- ✅ Plant ID = 2999 (gültige obere Grenze)
- ✅ Plant ID = 3000 (ungültige Grenze, Free-Tier Limitation)
- ✅ Negative Plant IDs
- ✅ Null und undefined Werte

### Fehlerfälle (Error Cases)
- ✅ API gibt nicht-OK Status zurück (404, 500)
- ✅ Netzwerkfehler
- ✅ Ungültige JSON-Antworten
- ✅ Fehlende erforderliche Daten

### Edge Cases
- ✅ Pflanzen ohne Bilddaten
- ✅ Fehlende `watering_general_benchmark` Daten
- ✅ Anführungszeichen in Daten müssen entfernt werden
- ✅ URL-Encoding für Sonderzeichen
- ✅ Paginierungsparameter

## Wichtige Lernerkenntnisse

### 1. Bedeutung von Mocking in Unit Tests
**Gelernt:** Mocking ist essentiell, um Unit Tests isoliert und unabhängig von externen Abhängigkeiten zu halten.

**Warum wichtig:**
- Tests laufen schneller (keine echten API-Aufrufe)
- Tests sind deterministisch (keine Abhängigkeit von externer API-Verfügbarkeit)
- Edge Cases und Fehlerfälle können leicht simuliert werden
- Keine Kosten durch API-Aufrufe während Tests

### 2. Test-Organisation mit describe/it-Blöcken
**Gelernt:** Eine klare Strukturierung der Tests macht sie wartbar und verständlich.

```javascript
describe('Hauptklasse', () => {
  describe('Methode1', () => {
    it('sollte bei normaler Eingabe funktionieren', () => {});
    it('sollte bei Fehlereingabe einen Fehler werfen', () => {});
  });
  describe('Methode2', () => {
    // weitere Tests
  });
});
```

### 3. beforeEach und afterEach für Clean Tests
**Gelernt:** Setup und Teardown sind wichtig, um Test-Isolation zu gewährleisten.

```javascript
beforeEach(() => {
  jest.clearAllMocks(); // Mocks vor jedem Test zurücksetzen
});

afterEach(() => {
  console.log.mockRestore(); // Spies wiederherstellen
});
```

**Warum wichtig:** Verhindert, dass ein Test den Zustand für nachfolgende Tests beeinflusst.

### 4. Grenzwertanalyse (Boundary Value Analysis)
**Gelernt:** Tests sollten die Grenzen des erwarteten Eingabebereichs abdecken.

**Beispiele aus den Tests:**
- Plant ID 2999 (gültig) vs. 3000 (ungültig)
- Leerer String vs. Whitespace vs. valider String
- 0, negative Zahlen, null, undefined

**Warum wichtig:** Die meisten Bugs treten an den Grenzen auf, nicht in der Mitte des Wertebereichs.

### 5. Async/Await Testing mit Jest
**Gelernt:** Asynchrone Tests müssen korrekt mit `async/await` behandelt werden.

```javascript
it('sollte asynchron funktionieren', async () => {
  const result = await plantApiService.searchPlants('test');
  expect(result).toEqual([]);
});

// Fehlererwartung bei async
await expect(plantApiService.getPlantDetails(0))
  .rejects.toThrow('Error message');
```

### 6. Mock-Verifikation
**Gelernt:** Es ist wichtig zu verifizieren, wie Mocks aufgerufen wurden.

```javascript
expect(fetch).toHaveBeenCalledTimes(1);
expect(fetch).toHaveBeenCalledWith(
  expect.stringContaining('expected-url-part')
);
expect(fetch).not.toHaveBeenCalled();
```

**Warum wichtig:** Stellt sicher, dass der Code die Abhängigkeiten korrekt verwendet.

### 7. Test-Driven Development (TDD) Prinzipien
**Gelernt:** Tests sollten:
- **Focused** sein (eine Sache testen)
- **Independent** sein (keine Abhängigkeiten zwischen Tests)
- **Repeatable** sein (gleiche Ergebnisse bei jedem Lauf)
- **Self-validating** sein (klare Pass/Fail-Ergebnisse)
- **Timely** geschrieben werden (idealerweise vor dem Code)

### 8. Bedeutung von Error Cases
**Gelernt:** Fehlerfälle zu testen ist genauso wichtig wie den Happy Path.

**Implementierte Fehlerszenarien:**
- Netzwerkfehler
- Ungültige Server-Responses
- Ungültige Eingabeparameter
- Fehlende Daten in API-Responses

### 9. Mocking von console.log/error
**Gelernt:** Console-Output kann Tests unübersichtlich machen und sollte gemockt werden.

```javascript
jest.spyOn(console, 'log').mockImplementation(() => {});
```

Dies unterdrückt Output, erlaubt aber trotzdem die Verifikation, dass Logging stattfindet.

### 10. Jest Matchers und Assertions
**Gelernt:** Jest bietet viele nützliche Matchers:

```javascript
expect(value).toBe(exactValue);
expect(value).toEqual(objectOrArray);
expect(array).toHaveLength(2);
expect(string).toContain('substring');
expect(fn).toThrow('error message');
expect(mock).toHaveBeenCalledWith(params);
```

## Best Practices aus diesem Projekt

1. **Klare Testnamen:** Jeder Test beschreibt genau, was getestet wird (in Deutsch, passend zum Projekt)
2. **AAA-Pattern:** Arrange-Act-Assert in jedem Test
3. **Keine Test-Abhängigkeiten:** Jeder Test kann isoliert laufen
4. **Mock-Reset:** Mocks werden vor jedem Test zurückgesetzt
5. **Dokumentation:** Kommentare erklären, was jeder Test prüft

## Zusammenfassung

Die Erstellung dieser Unit Tests hat gezeigt, wie wichtig eine umfassende Testabdeckung ist:
- **23 Tests** decken verschiedene Szenarien ab
- **Jest Mocking** ermöglicht isolierte Unit Tests
- **Grenzwerte und Fehlerszenarien** werden explizit getestet
- **Code-Qualität** wird durch automatisierte Tests sichergestellt

Die Tests dienen als:
- Sicherheitsnetz bei Code-Änderungen
- Dokumentation der erwarteten Funktionsweise
- Beispiele für die korrekte Verwendung der API

## Ausführen der Tests

```bash
npm test -- CopilotUnittest2
```

Oder alle Tests:
```bash
npm test
```
