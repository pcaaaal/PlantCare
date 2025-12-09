# CopilotUnittest2 - Test Code Screenshots und Übersicht

## Übersicht der erstellten Tests

Dieses Dokument zeigt Screenshots und Code-Ausschnitte der erstellten Unit Tests.

---

## 1. Test-Datei Header und Setup

Die Test-Datei beginnt mit der Einrichtung der Mocks:

```javascript
/**
 * CopilotUnittest2 - Unit Tests for plantApiService
 * 
 * This test suite demonstrates comprehensive unit testing with mocks,
 * including boundary cases, error handling, and edge cases.
 * Testing framework: Jest
 * Mock framework: Jest mocking capabilities
 */

import { plantApiService } from '../plantApiService';

// Mock the global fetch function
global.fetch = jest.fn();

// Mock Constants from expo-constants
jest.mock('expo-constants', () => ({
  expoConfig: {
    extra: {
      perenualApiKey: 'test-api-key',
      perenualApiUrl: 'https://test-api.com',
    },
  },
}));
```

**Was passiert hier:**
- Wir importieren den zu testenden Service
- Die `fetch` API wird gemockt (für HTTP-Requests)
- Das `expo-constants` Modul wird gemockt (für API-Konfiguration)

---

## 2. Test Setup mit beforeEach/afterEach

```javascript
describe('CopilotUnittest2 - plantApiService', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    // Clear console.log and console.error to avoid cluttering test output
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore console methods
    console.log.mockRestore();
    console.error.mockRestore();
  });
```

**Was passiert hier:**
- Vor jedem Test werden alle Mocks zurückgesetzt
- Console-Output wird unterdrückt (cleaner Test-Output)
- Nach jedem Test werden Console-Methoden wiederhergestellt

---

## 3. Test Suite 1: searchPlants - Normale Fälle

### Test 1a: Erfolgreiche Suche

```javascript
describe('searchPlants', () => {
  it('sollte Pflanzen erfolgreich suchen und korrekt formatieren', async () => {
    const mockResponse = {
      data: [
        {
          id: 1,
          common_name: 'Aloe Vera',
          scientific_name: ['Aloe barbadensis'],
          family: 'Asphodelaceae',
          default_image: {
            thumbnail: 'https://example.com/aloe.jpg',
            small_url: 'https://example.com/aloe-small.jpg',
          },
        },
        {
          id: 2,
          common_name: 'Snake Plant',
          scientific_name: ['Sansevieria trifasciata'],
          family: 'Asparagaceae',
          default_image: {
            thumbnail: 'https://example.com/snake.jpg',
          },
        },
      ],
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await plantApiService.searchPlants('aloe');

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('species-list')
    );
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      id: 1,
      name: 'Aloe Vera',
      scientificName: ['Aloe barbadensis'],
      family: 'Asphodelaceae',
      imageUrl: 'https://example.com/aloe.jpg',
    });
  });
```

**Was wird getestet:**
- ✅ Mock-Response wird definiert
- ✅ Fetch wird einmal aufgerufen
- ✅ Korrekte URL wird verwendet
- ✅ Daten werden korrekt transformiert
- ✅ Rückgabewert hat erwartetes Format

---

## 4. Grenzwert-Tests (Boundary Cases)

### Test 1b: Leerer Query-String

```javascript
it('sollte ein leeres Array zurückgeben bei leerem Query-String', async () => {
  const result = await plantApiService.searchPlants('');
  
  expect(fetch).not.toHaveBeenCalled();
  expect(result).toEqual([]);
});
```

**Getestet:** Verhalten bei leerem Input

### Test 1c: Whitespace-Only Query

```javascript
it('sollte ein leeres Array zurückgeben bei Query mit nur Leerzeichen', async () => {
  const result = await plantApiService.searchPlants('   ');
  
  expect(fetch).not.toHaveBeenCalled();
  expect(result).toEqual([]);
});
```

**Getestet:** Verhalten bei ungültigem Input (nur Leerzeichen)

### Test 1d: Free-Tier Limitation (ID >= 3000)

```javascript
it('sollte Pflanzen mit ID >= 3000 herausfiltern (Free-Tier Limitation)', async () => {
  const mockResponse = {
    data: [
      {
        id: 2999,
        common_name: 'Valid Plant',
        scientific_name: ['Plant A'],
        family: 'FamilyA',
        default_image: { thumbnail: 'url1.jpg' },
      },
      {
        id: 3000,
        common_name: 'Invalid Plant 1',
        scientific_name: ['Plant B'],
        family: 'FamilyB',
        default_image: { thumbnail: 'url2.jpg' },
      },
      {
        id: 3500,
        common_name: 'Invalid Plant 2',
        scientific_name: ['Plant C'],
        family: 'FamilyC',
        default_image: { thumbnail: 'url3.jpg' },
      },
    ],
  };

  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => mockResponse,
  });

  const result = await plantApiService.searchPlants('plant');

  expect(result).toHaveLength(1);
  expect(result[0].id).toBe(2999);
  expect(result[0].name).toBe('Valid Plant');
});
```

**Getestet:** Geschäftslogik - Filterung von Pflanzen basierend auf ID-Grenze

---

## 5. Fehler-Tests (Error Cases)

### Test 1e: API gibt Fehler-Status zurück

```javascript
it('sollte einen Fehler werfen bei nicht-erfolgreicher API-Antwort', async () => {
  fetch.mockResolvedValueOnce({
    ok: false,
    status: 404,
  });

  await expect(plantApiService.searchPlants('test')).rejects.toThrow(
    'API request failed with status 404'
  );
});
```

**Getestet:** Fehlerbehandlung bei HTTP-Fehler

### Test 1f: Netzwerkfehler

```javascript
it('sollte einen Fehler werfen bei Netzwerkfehler', async () => {
  fetch.mockRejectedValueOnce(new Error('Network error'));

  await expect(plantApiService.searchPlants('test')).rejects.toThrow(
    'Network error'
  );
});
```

**Getestet:** Fehlerbehandlung bei Netzwerkproblemen

---

## 6. Test Suite 2: getPlantDetails - Boundary Cases

### Test 2b-2d: Ungültige Plant IDs

```javascript
it('sollte einen Fehler werfen bei plantId = 0', async () => {
  await expect(plantApiService.getPlantDetails(0)).rejects.toThrow(
    'Invalid plant ID or ID not available in free tier'
  );
  
  expect(fetch).not.toHaveBeenCalled();
});

it('sollte einen Fehler werfen bei null plantId', async () => {
  await expect(plantApiService.getPlantDetails(null)).rejects.toThrow(
    'Invalid plant ID or ID not available in free tier'
  );
  
  expect(fetch).not.toHaveBeenCalled();
});

it('sollte einen Fehler werfen bei undefined plantId', async () => {
  await expect(plantApiService.getPlantDetails(undefined)).rejects.toThrow(
    'Invalid plant ID or ID not available in free tier'
  );
  
  expect(fetch).not.toHaveBeenCalled();
});
```

**Getestet:** 
- ✅ Falsy values (0, null, undefined)
- ✅ Keine API-Aufrufe bei ungültigen Inputs
- ✅ Korrekte Fehlermeldungen

### Test 2e: ID-Grenzwerte

```javascript
it('sollte einen Fehler werfen bei plantId >= 3000', async () => {
  await expect(plantApiService.getPlantDetails(3000)).rejects.toThrow(
    'Invalid plant ID or ID not available in free tier'
  );
  
  await expect(plantApiService.getPlantDetails(5000)).rejects.toThrow(
    'Invalid plant ID or ID not available in free tier'
  );
  
  expect(fetch).not.toHaveBeenCalled();
});

it('sollte plantId = 2999 akzeptieren (gültige Grenze)', async () => {
  const mockResponse = {
    id: 2999,
    common_name: 'Boundary Plant',
    scientific_name: [],
    watering: 'Average',
  };

  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => mockResponse,
  });

  const result = await plantApiService.getPlantDetails(2999);

  expect(fetch).toHaveBeenCalledTimes(1);
  expect(result.id).toBe(2999);
});
```

**Getestet:**
- ✅ Obere Grenze (2999 = gültig, 3000+ = ungültig)
- ✅ Grenzwertanalyse

---

## 7. Edge Cases: Fehlende Daten

### Test 2g: Fehlende watering_general_benchmark

```javascript
it('sollte Default-Werte für fehlende watering_general_benchmark setzen', async () => {
  const mockResponse = {
    id: 1,
    common_name: 'Test Plant',
    scientific_name: [],
    watering: 'Average',
    watering_general_benchmark: null,
  };

  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => mockResponse,
  });

  const result = await plantApiService.getPlantDetails(1);

  expect(result.wateringGeneralBenchmark).toEqual({
    value: '7',
    unit: 'days',
  });
});
```

**Getestet:** Fallback-Werte bei fehlenden optionalen Daten

### Test 2h: Entfernen von Anführungszeichen

```javascript
it('sollte Anführungszeichen aus watering_general_benchmark entfernen', async () => {
  const mockResponse = {
    id: 1,
    common_name: 'Test Plant',
    scientific_name: [],
    watering_general_benchmark: {
      value: '"14"',
      unit: 'days',
    },
  };

  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => mockResponse,
  });

  const result = await plantApiService.getPlantDetails(1);

  expect(result.wateringGeneralBenchmark.value).toBe('14');
  expect(result.wateringGeneralBenchmark.value).not.toContain('"');
});
```

**Getestet:** Datenbereinigung/Transformation

---

## 8. Mock-Verifikation

### Test 3a: Korrekte API-Key Verwendung

```javascript
it('sollte fetch mit korrektem API-Key aufrufen', async () => {
  const mockResponse = { data: [] };

  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => mockResponse,
  });

  await plantApiService.searchPlants('test');

  expect(fetch).toHaveBeenCalledWith(
    expect.stringContaining('key=test-api-key')
  );
});
```

**Getestet:** Mock wird korrekt mit API-Key aufgerufen

### Test 3b: URL-Encoding

```javascript
it('sollte Sonderzeichen im Query-String korrekt kodieren', async () => {
  const mockResponse = { data: [] };

  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => mockResponse,
  });

  await plantApiService.searchPlants('plant & flower');

  const callUrl = fetch.mock.calls[0][0];
  expect(callUrl).toContain('plant%20%26%20flower');
});
```

**Getestet:** Korrekte URL-Kodierung von Sonderzeichen

---

## Zusammenfassung

### Test-Statistiken:
- **Gesamt:** 23 Unit Tests
- **Test Suite 1 (searchPlants):** 8 Tests
- **Test Suite 2 (getPlantDetails):** 11 Tests
- **Test Suite 3 (Mock Verification):** 4 Tests

### Abdeckung:

#### ✅ Normale Fälle (Happy Path)
- Erfolgreiche API-Aufrufe
- Korrekte Datenformatierung

#### ✅ Grenzwerte (Boundary Cases)
- Leere/Whitespace Inputs
- ID-Grenzen (0, 2999, 3000)
- Null/Undefined Werte
- Negative Zahlen

#### ✅ Fehlerfälle (Error Cases)
- HTTP-Fehler (404, 500)
- Netzwerkfehler
- Ungültige JSON-Responses

#### ✅ Edge Cases
- Fehlende optionale Daten
- Datenbereinigung
- URL-Encoding
- Paginierung

### Verwendete Mock-Techniken:
1. `jest.fn()` - Function Mocks
2. `jest.mock()` - Module Mocks
3. `jest.spyOn()` - Spy auf bestehende Funktionen
4. `mockResolvedValueOnce()` - Async Mock-Returns
5. `mockRejectedValueOnce()` - Async Mock-Errors

---

## Ausführung

Die Tests können ausgeführt werden mit:

```bash
npm test CopilotUnittest2
```

Oder mit Coverage-Report:

```bash
npm test -- --coverage CopilotUnittest2
```

Alle Tests:

```bash
npm test
```

---

## Datei-Struktur

```
PlantCare/
├── src/
│   └── services/
│       ├── plantApiService.js          # Zu testende Klasse
│       └── __tests__/
│           └── CopilotUnittest2.test.js  # Unit Tests mit Mocks
├── UNITTEST_DOCUMENTATION.md            # Ausführliche Dokumentation
└── UNITTEST_SCREENSHOTS.md              # Dieses Dokument
```
