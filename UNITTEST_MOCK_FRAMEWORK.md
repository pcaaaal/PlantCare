# TimoBalsigerUnittest2 - Mock Framework Dokumentation

**Autor:** Timo Balsiger

## Übersicht

Dieses Dokument erklärt die Verwendung des Mock Frameworks (Jest) in den Unit Tests. Jest ist das JavaScript-Äquivalent zu **Mockito** (Java) und bietet ähnliche Funktionalitäten für das Erstellen und Verifizieren von Mock-Objekten.

---

## Mock Framework: Jest (äquivalent zu Mockito)

### Vergleich Jest vs. Mockito

| Mockito (Java) | Jest (JavaScript) | Beschreibung |
|----------------|-------------------|--------------|
| `@Mock` | `jest.mock()` | Mock-Objekt erstellen |
| `when().thenReturn()` | `mockResolvedValue()` | Rückgabewert konfigurieren |
| `when().thenThrow()` | `mockRejectedValue()` | Exception werfen |
| `verify()` | `expect().toHaveBeenCalled()` | Methodenaufruf verifizieren |
| `verify(times(n))` | `expect().toHaveBeenCalledTimes(n)` | Anzahl Aufrufe prüfen |
| `verify(never())` | `expect().not.toHaveBeenCalled()` | Niemals aufgerufen |
| `reset()` | `mockReset()` | Mock zurücksetzen |
| `clearInvocations()` | `mockClear()` | Aufruf-Historie löschen |
| `@Spy` | `jest.spyOn()` | Partielles Mocking |

---

## 1. Mock-Klasse erstellen

### Datei: `__mocks__/plantApiService.js`

Die Mock-Klasse ist in einer separaten Datei definiert (ähnlich wie Mockito Mock-Objekte):

```javascript
/**
 * Mock class for plantApiService
 * Similar to Mockito's @Mock annotation
 */
export const plantApiService = {
  searchPlants: jest.fn((query, page = 1) => {
    return Promise.resolve([]);
  }),
  
  getPlantDetails: jest.fn((plantId) => {
    return Promise.resolve({
      id: plantId,
      name: 'Mock Plant',
      // ... weitere Felder
    });
  }),
};
```

**Vorteile:**
- ✅ Wiederverwendbar in mehreren Tests
- ✅ Zentralisierte Mock-Definitionen
- ✅ Ähnlich zu Mockito's Ansatz mit separaten Mock-Objekten

---

## 2. Mock konfigurieren (when/thenReturn Pattern)

### Mockito-Stil in Java:
```java
when(plantApiService.searchPlants("aloe"))
    .thenReturn(mockPlants);
```

### Jest-Äquivalent:
```javascript
plantApiService.searchPlants.mockResolvedValue(mockPlants);
```

### Beispiel Test:
```javascript
it('sollte Mock konfigurieren und Wert zurückgeben', async () => {
  // ARRANGE - Mock konfigurieren
  const mockPlants = [
    { id: 1, name: 'Mocked Aloe Vera' },
    { id: 2, name: 'Mocked Cactus' }
  ];
  
  plantApiService.searchPlants.mockResolvedValue(mockPlants);
  
  // ACT - Methode aufrufen
  const result = await plantApiService.searchPlants('aloe');
  
  // ASSERT - Ergebnis prüfen
  expect(result).toEqual(mockPlants);
  expect(result).toHaveLength(2);
});
```

---

## 3. Mehrere Aufrufe konfigurieren

### Mockito-Stil:
```java
when(mock.method())
    .thenReturn(value1)
    .thenReturn(value2)
    .thenReturn(value3);
```

### Jest-Äquivalent:
```javascript
plantApiService.searchPlants
  .mockResolvedValueOnce([{ id: 1, name: 'First' }])
  .mockResolvedValueOnce([{ id: 2, name: 'Second' }])
  .mockResolvedValueOnce([{ id: 3, name: 'Third' }]);
```

### Beispiel Test:
```javascript
it('sollte unterschiedliche Werte zurückgeben', async () => {
  plantApiService.searchPlants
    .mockResolvedValueOnce([{ id: 1, name: 'First Call' }])
    .mockResolvedValueOnce([{ id: 2, name: 'Second Call' }]);
  
  const result1 = await plantApiService.searchPlants('test1');
  expect(result1[0].name).toBe('First Call');
  
  const result2 = await plantApiService.searchPlants('test2');
  expect(result2[0].name).toBe('Second Call');
});
```

---

## 4. Exception werfen (when/thenThrow Pattern)

### Mockito-Stil:
```java
when(plantApiService.searchPlants("test"))
    .thenThrow(new NetworkException("Network error"));
```

### Jest-Äquivalent:
```javascript
plantApiService.searchPlants.mockRejectedValue(
  new Error('Network error from mock')
);
```

### Beispiel Test:
```javascript
it('sollte Exception werfen', async () => {
  // Mock konfigurieren um Fehler zu werfen
  plantApiService.searchPlants.mockRejectedValue(
    new Error('Network error from mock')
  );
  
  // Erwarten dass Mock einen Fehler wirft
  await expect(plantApiService.searchPlants('test'))
    .rejects.toThrow('Network error from mock');
});
```

---

## 5. Mock-Verifikation (verify Pattern)

### a) Methode wurde aufgerufen

**Mockito:**
```java
verify(plantApiService).searchPlants("aloe");
```

**Jest:**
```javascript
expect(plantApiService.searchPlants).toHaveBeenCalled();
expect(plantApiService.searchPlants).toHaveBeenCalledWith('aloe');
```

### b) Methode wurde N mal aufgerufen

**Mockito:**
```java
verify(plantApiService, times(3)).searchPlants(anyString());
```

**Jest:**
```javascript
expect(plantApiService.searchPlants).toHaveBeenCalledTimes(3);
```

### c) Methode wurde nie aufgerufen

**Mockito:**
```java
verify(plantApiService, never()).searchPlants(anyString());
```

**Jest:**
```javascript
expect(plantApiService.searchPlants).not.toHaveBeenCalled();
```

### Beispiel Test:
```javascript
it('sollte Methodenaufrufe verifizieren', async () => {
  plantApiService.searchPlants.mockResolvedValue([]);
  
  // Methode 3x aufrufen
  await plantApiService.searchPlants('test1');
  await plantApiService.searchPlants('test2');
  await plantApiService.searchPlants('test3');
  
  // Verifizieren (wie Mockito's verify())
  expect(plantApiService.searchPlants).toHaveBeenCalledTimes(3);
  expect(plantApiService.searchPlants).toHaveBeenCalledWith('test1');
  expect(plantApiService.searchPlants).toHaveBeenCalledWith('test2');
  expect(plantApiService.searchPlants).toHaveBeenCalledWith('test3');
});
```

---

## 6. Parameterspezifisches Mocking

### Mit mockImplementation:
```javascript
plantApiService.getPlantDetails.mockImplementation((plantId) => {
  if (plantId === 1) {
    return Promise.resolve({ id: 1, name: 'Aloe Vera' });
  } else if (plantId === 2) {
    return Promise.resolve({ id: 2, name: 'Cactus' });
  }
  return Promise.reject(new Error('Plant not found'));
});
```

### Beispiel Test:
```javascript
it('sollte verschiedene Werte für verschiedene Parameter zurückgeben', async () => {
  plantApiService.getPlantDetails.mockImplementation((plantId) => {
    if (plantId === 1) return Promise.resolve({ id: 1, name: 'Aloe' });
    if (plantId === 2) return Promise.resolve({ id: 2, name: 'Cactus' });
    return Promise.reject(new Error('Not found'));
  });
  
  const plant1 = await plantApiService.getPlantDetails(1);
  expect(plant1.name).toBe('Aloe');
  
  const plant2 = await plantApiService.getPlantDetails(2);
  expect(plant2.name).toBe('Cactus');
  
  await expect(plantApiService.getPlantDetails(999))
    .rejects.toThrow('Not found');
});
```

---

## 7. Mock zurücksetzen (reset/clear)

### Mockito-Stil:
```java
Mockito.reset(plantApiService);        // Alles zurücksetzen
Mockito.clearInvocations(plantApiService); // Nur Historie löschen
```

### Jest-Äquivalent:
```javascript
plantApiService.searchPlants.mockReset();  // Alles zurücksetzen
plantApiService.searchPlants.mockClear();  // Nur Historie löschen
```

### Beispiel Test:
```javascript
it('sollte Mock zurücksetzen können', async () => {
  // Mock konfigurieren und aufrufen
  plantApiService.searchPlants.mockResolvedValue([{ id: 1 }]);
  await plantApiService.searchPlants('test');
  expect(plantApiService.searchPlants).toHaveBeenCalledTimes(1);
  
  // Mock-Historie löschen
  plantApiService.searchPlants.mockClear();
  expect(plantApiService.searchPlants).not.toHaveBeenCalled();
  
  // Neu konfigurieren
  plantApiService.searchPlants.mockResolvedValue([{ id: 2 }]);
  await plantApiService.searchPlants('test2');
  expect(plantApiService.searchPlants).toHaveBeenCalledTimes(1);
});
```

---

## 8. Spy-Funktionalität (Partielles Mocking)

### Mockito-Stil:
```java
@Spy
PlantApiService plantApiService;
```

### Jest-Äquivalent:
```javascript
const spy = jest.spyOn(plantApiService, 'searchPlants');
```

### Beispiel:
```javascript
it('sollte Spy-Funktionalität nutzen', async () => {
  const spy = jest.spyOn(plantApiService, 'searchPlants');
  spy.mockResolvedValue([{ id: 1, name: 'Test' }]);
  
  await plantApiService.searchPlants('test');
  
  expect(spy).toHaveBeenCalledWith('test');
  spy.mockRestore(); // Spy wiederherstellen
});
```

---

## 9. Test-Struktur (AAA-Pattern)

### Arrange-Act-Assert Pattern:
```javascript
it('sollte Test mit AAA-Pattern strukturieren', async () => {
  // ARRANGE - Setup und Mock-Konfiguration
  const mockData = [{ id: 1, name: 'Test Plant' }];
  plantApiService.searchPlants.mockResolvedValue(mockData);
  
  // ACT - Aktion ausführen
  const result = await plantApiService.searchPlants('test');
  
  // ASSERT - Ergebnis prüfen
  expect(result).toEqual(mockData);
  expect(plantApiService.searchPlants).toHaveBeenCalledWith('test');
});
```

---

## 10. Vollständiges Beispiel

### Test-Datei: `TimoBalsigerUnittest2MockFramework.test.js`

```javascript
import { plantApiService } from '../plantApiService';

// Mock aktivieren
jest.mock('../plantApiService');

describe('TimoBalsigerUnittest2 - Mock Framework Demo', () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Mocks vor jedem Test zurücksetzen
  });

  it('sollte Mock Framework demonstrieren', async () => {
    // ARRANGE - Mock konfigurieren (wie Mockito's when().thenReturn())
    const mockPlants = [
      { id: 1, name: 'Aloe Vera' },
      { id: 2, name: 'Cactus' }
    ];
    plantApiService.searchPlants.mockResolvedValue(mockPlants);
    
    // ACT - Methode aufrufen
    const result = await plantApiService.searchPlants('aloe');
    
    // ASSERT - Ergebnis und Aufrufe verifizieren
    expect(result).toEqual(mockPlants);
    expect(result).toHaveLength(2);
    
    // Verifikation (wie Mockito's verify())
    expect(plantApiService.searchPlants).toHaveBeenCalledTimes(1);
    expect(plantApiService.searchPlants).toHaveBeenCalledWith('aloe');
  });
});
```

---

## Zusammenfassung

### Mock Framework Funktionen demonstriert:

1. ✅ **Mock-Klasse erstellen** (`__mocks__/plantApiService.js`)
2. ✅ **Mock konfigurieren** (`mockResolvedValue` = `when().thenReturn()`)
3. ✅ **Mehrere Aufrufe** (`mockResolvedValueOnce`)
4. ✅ **Exception werfen** (`mockRejectedValue` = `when().thenThrow()`)
5. ✅ **Verifikation** (`toHaveBeenCalled` = `verify()`)
6. ✅ **Anzahl Aufrufe** (`toHaveBeenCalledTimes` = `verify(times(n))`)
7. ✅ **Parameter prüfen** (`toHaveBeenCalledWith`)
8. ✅ **Mock zurücksetzen** (`mockReset`, `mockClear`)
9. ✅ **Spy-Funktionalität** (`jest.spyOn`)
10. ✅ **Parameterspezifisches Mocking** (`mockImplementation`)

### Vorteile des Mock Frameworks:

- 🎯 **Isolierte Tests**: Keine Abhängigkeit von echten APIs
- 🚀 **Schnelle Ausführung**: Keine Netzwerk-Aufrufe
- 🔧 **Kontrolliertes Verhalten**: Exakte Kontrolle über Rückgabewerte
- ✅ **Verifikation**: Prüfung von Methodenaufrufen und Parametern
- 🐛 **Fehlerszenarien**: Einfaches Testen von Edge Cases

---

## Ausführen der Mock-Framework Tests

```bash
npm test TimoBalsigerUnittest2MockFramework
```

Oder alle Tests:
```bash
npm test
```
