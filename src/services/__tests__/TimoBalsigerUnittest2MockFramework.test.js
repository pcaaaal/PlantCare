/**
 * TimoBalsigerUnittest2 - Mock Framework Demo
 * Author: Timo Balsiger
 * 
 * This test suite demonstrates the use of a Mock Framework (Jest)
 * equivalent to Mockito in Java. It shows how to create and use
 * mock objects similar to Mockito's when().thenReturn() and verify() patterns.
 * 
 * Mock Framework: Jest (equivalent to Mockito for JavaScript)
 * Testing Framework: Jest (equivalent to JUnit)
 */

// Import the mock class (similar to @Mock annotation in Mockito)
jest.mock('../plantApiService');

import { plantApiService } from '../plantApiService';

describe('TimoBalsigerUnittest2 - Mock Framework Demo', () => {
  beforeEach(() => {
    // Reset mocks before each test (similar to Mockito.reset())
    jest.clearAllMocks();
  });

  /**
   * Test Suite 1: Mockito-Style Mock Configuration
   * Demonstrates how to configure mock behavior using Jest
   * (equivalent to Mockito's when().thenReturn() pattern)
   */
  describe('Mock Configuration (Mockito-style when/thenReturn)', () => {
    /**
     * Test 1a: Configure mock to return specific value
     * Pattern: when(mock.method(args)).thenReturn(value)
     */
    it('sollte Mock konfigurieren und spezifischen Wert zurückgeben', async () => {
      // ARRANGE - Configure mock (like Mockito's when().thenReturn())
      const mockPlants = [
        {
          id: 1,
          name: 'Mocked Aloe Vera',
          scientificName: ['Aloe barbadensis'],
          family: 'Asphodelaceae',
          imageUrl: 'mock-image.jpg',
        },
        {
          id: 2,
          name: 'Mocked Cactus',
          scientificName: ['Cactaceae'],
          family: 'Cactaceae',
          imageUrl: 'cactus.jpg',
        },
      ];

      // Configure mock behavior - Jest equivalent of:
      // when(plantApiService.searchPlants("aloe")).thenReturn(mockPlants)
      plantApiService.searchPlants.mockResolvedValue(mockPlants);

      // ACT - Call the mocked method
      const result = await plantApiService.searchPlants('aloe');

      // ASSERT - Verify the result
      expect(result).toEqual(mockPlants);
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Mocked Aloe Vera');
    });

    /**
     * Test 1b: Configure mock with different returns for different calls
     * Pattern: when().thenReturn().thenReturn() - multiple calls
     */
    it('sollte unterschiedliche Werte bei mehreren Aufrufen zurückgeben', async () => {
      // Configure mock for first call
      plantApiService.searchPlants
        .mockResolvedValueOnce([{ id: 1, name: 'First Call Result' }])
        .mockResolvedValueOnce([{ id: 2, name: 'Second Call Result' }])
        .mockResolvedValueOnce([{ id: 3, name: 'Third Call Result' }]);

      // First call
      const result1 = await plantApiService.searchPlants('test1');
      expect(result1[0].name).toBe('First Call Result');

      // Second call
      const result2 = await plantApiService.searchPlants('test2');
      expect(result2[0].name).toBe('Second Call Result');

      // Third call
      const result3 = await plantApiService.searchPlants('test3');
      expect(result3[0].name).toBe('Third Call Result');
    });

    /**
     * Test 1c: Configure mock to throw exception
     * Pattern: when().thenThrow()
     */
    it('sollte eine Exception werfen wenn konfiguriert', async () => {
      // Configure mock to throw error (like Mockito's when().thenThrow())
      plantApiService.searchPlants.mockRejectedValue(
        new Error('Network error from mock')
      );

      // Expect the mock to throw
      await expect(plantApiService.searchPlants('test')).rejects.toThrow(
        'Network error from mock'
      );
    });

    /**
     * Test 1d: Configure mock for getPlantDetails with specific ID
     * Demonstrates parameter-specific mocking
     */
    it('sollte Mock mit spezifischen Parametern konfigurieren', async () => {
      // Configure mock to return different values based on parameter
      plantApiService.getPlantDetails.mockImplementation((plantId) => {
        if (plantId === 1) {
          return Promise.resolve({
            id: 1,
            name: 'Aloe Vera Details',
            careLevel: 'Easy',
          });
        } else if (plantId === 2) {
          return Promise.resolve({
            id: 2,
            name: 'Cactus Details',
            careLevel: 'Very Easy',
          });
        }
        return Promise.reject(new Error('Plant not found'));
      });

      // Test with ID 1
      const plant1 = await plantApiService.getPlantDetails(1);
      expect(plant1.name).toBe('Aloe Vera Details');
      expect(plant1.careLevel).toBe('Easy');

      // Test with ID 2
      const plant2 = await plantApiService.getPlantDetails(2);
      expect(plant2.name).toBe('Cactus Details');
      expect(plant2.careLevel).toBe('Very Easy');

      // Test with invalid ID
      await expect(plantApiService.getPlantDetails(999)).rejects.toThrow(
        'Plant not found'
      );
    });
  });

  /**
   * Test Suite 2: Mockito-Style Verification
   * Demonstrates how to verify mock interactions using Jest
   * (equivalent to Mockito's verify() pattern)
   */
  describe('Mock Verification (Mockito-style verify)', () => {
    /**
     * Test 2a: Verify method was called
     * Pattern: verify(mock).method()
     */
    it('sollte verifizieren dass Methode aufgerufen wurde', async () => {
      // Configure mock
      plantApiService.searchPlants.mockResolvedValue([]);

      // Call the method
      await plantApiService.searchPlants('test');

      // Verify method was called (like Mockito's verify())
      expect(plantApiService.searchPlants).toHaveBeenCalled();
    });

    /**
     * Test 2b: Verify method was called with specific arguments
     * Pattern: verify(mock).method(args)
     */
    it('sollte verifizieren dass Methode mit korrekten Argumenten aufgerufen wurde', async () => {
      plantApiService.searchPlants.mockResolvedValue([]);

      // Call with specific arguments
      await plantApiService.searchPlants('aloe', 2);

      // Verify method was called with correct arguments
      expect(plantApiService.searchPlants).toHaveBeenCalledWith('aloe', 2);
    });

    /**
     * Test 2c: Verify method was called exact number of times
     * Pattern: verify(mock, times(n)).method()
     */
    it('sollte verifizieren dass Methode exakt N mal aufgerufen wurde', async () => {
      plantApiService.searchPlants.mockResolvedValue([]);

      // Call method 3 times
      await plantApiService.searchPlants('test1');
      await plantApiService.searchPlants('test2');
      await plantApiService.searchPlants('test3');

      // Verify method was called exactly 3 times (like verify(mock, times(3)))
      expect(plantApiService.searchPlants).toHaveBeenCalledTimes(3);
    });

    /**
     * Test 2d: Verify method was never called
     * Pattern: verify(mock, never()).method()
     */
    it('sollte verifizieren dass Methode niemals aufgerufen wurde', () => {
      // Don't call the method

      // Verify method was never called (like verify(mock, never()))
      expect(plantApiService.searchPlants).not.toHaveBeenCalled();
    });

    /**
     * Test 2e: Verify multiple method calls with different arguments
     * Pattern: verify multiple interactions
     */
    it('sollte mehrere Methodenaufrufe mit verschiedenen Argumenten verifizieren', async () => {
      plantApiService.getPlantDetails.mockResolvedValue({});

      // Call method multiple times with different arguments
      await plantApiService.getPlantDetails(1);
      await plantApiService.getPlantDetails(2);
      await plantApiService.getPlantDetails(3);

      // Verify each call
      expect(plantApiService.getPlantDetails).toHaveBeenNthCalledWith(1, 1);
      expect(plantApiService.getPlantDetails).toHaveBeenNthCalledWith(2, 2);
      expect(plantApiService.getPlantDetails).toHaveBeenNthCalledWith(3, 3);
    });

    /**
     * Test 2f: Verify call order
     * Pattern: InOrder verification in Mockito
     */
    it('sollte Aufruf-Reihenfolge verifizieren', async () => {
      plantApiService.searchPlants.mockResolvedValue([]);
      plantApiService.getPlantDetails.mockResolvedValue({});

      // Call methods in specific order
      await plantApiService.searchPlants('aloe');
      await plantApiService.getPlantDetails(1);
      await plantApiService.searchPlants('cactus');

      // Verify call order and total calls
      expect(plantApiService.searchPlants).toHaveBeenCalledTimes(2);
      expect(plantApiService.getPlantDetails).toHaveBeenCalledTimes(1);
      
      // Verify the order of the searchPlants calls
      expect(plantApiService.searchPlants).toHaveBeenNthCalledWith(1, 'aloe');
      expect(plantApiService.searchPlants).toHaveBeenNthCalledWith(2, 'cactus');
    });
  });

  /**
   * Test Suite 3: Mock Boundary and Error Cases
   * Tests edge cases using the mock framework
   */
  describe('Mock Framework - Boundary and Error Cases', () => {
    /**
     * Test 3a: Mock with null/undefined return values
     */
    it('sollte null/undefined Werte korrekt mocken', async () => {
      plantApiService.searchPlants.mockResolvedValue(null);

      const result = await plantApiService.searchPlants('test');
      expect(result).toBeNull();
    });

    /**
     * Test 3b: Mock with empty arrays
     */
    it('sollte leere Arrays zurückgeben', async () => {
      plantApiService.searchPlants.mockResolvedValue([]);

      const result = await plantApiService.searchPlants('');
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    /**
     * Test 3c: Mock with boundary value IDs
     */
    it('sollte Grenzwert-IDs korrekt behandeln', async () => {
      // Mock for ID 0
      plantApiService.getPlantDetails.mockResolvedValueOnce({
        id: 0,
        name: 'Plant with ID 0',
      });

      const plant0 = await plantApiService.getPlantDetails(0);
      expect(plant0.id).toBe(0);

      // Mock for ID 2999 (boundary)
      plantApiService.getPlantDetails.mockResolvedValueOnce({
        id: 2999,
        name: 'Plant at boundary',
      });

      const plant2999 = await plantApiService.getPlantDetails(2999);
      expect(plant2999.id).toBe(2999);

      // Mock for ID 3000 (should throw)
      plantApiService.getPlantDetails.mockRejectedValueOnce(
        new Error('Invalid plant ID or ID not available in free tier')
      );

      await expect(plantApiService.getPlantDetails(3000)).rejects.toThrow(
        'Invalid plant ID or ID not available in free tier'
      );
    });

    /**
     * Test 3d: Mock with timeout/delay simulation
     */
    it('sollte Timeout-Szenarien simulieren', async () => {
      // Simulate a slow response
      plantApiService.searchPlants.mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve([{ id: 1, name: 'Delayed Plant' }]), 100);
          })
      );

      const result = await plantApiService.searchPlants('test');
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Delayed Plant');
    });

    /**
     * Test 3e: Mock reset and clear functionality
     */
    it('sollte Mock-Zustand zurücksetzen können', async () => {
      // Configure and call mock
      plantApiService.searchPlants.mockResolvedValue([{ id: 1 }]);
      await plantApiService.searchPlants('test');
      expect(plantApiService.searchPlants).toHaveBeenCalledTimes(1);

      // Clear mock calls (like Mockito's clearInvocations())
      plantApiService.searchPlants.mockClear();
      expect(plantApiService.searchPlants).not.toHaveBeenCalled();

      // Configure again and verify it works
      plantApiService.searchPlants.mockResolvedValue([{ id: 2 }]);
      await plantApiService.searchPlants('test2');
      expect(plantApiService.searchPlants).toHaveBeenCalledTimes(1);
    });
  });

  /**
   * Test Suite 4: Mock Spy Behavior
   * Demonstrates spy functionality (partial mocking)
   */
  describe('Mock Spy Behavior (Mockito-style @Spy)', () => {
    /**
     * Test 4a: Verify arguments passed to mock
     */
    it('sollte übergebene Argumente verifizieren', async () => {
      plantApiService.searchPlants.mockResolvedValue([]);

      await plantApiService.searchPlants('aloe', 3);

      // Access mock call arguments
      const calls = plantApiService.searchPlants.mock.calls;
      expect(calls[0][0]).toBe('aloe');
      expect(calls[0][1]).toBe(3);
    });

    /**
     * Test 4b: Verify return values from mock
     */
    it('sollte Rückgabewerte von Mock verifizieren', async () => {
      const mockReturnValue = [{ id: 1, name: 'Test Plant' }];
      plantApiService.searchPlants.mockResolvedValue(mockReturnValue);

      const result = await plantApiService.searchPlants('test');

      // Verify return value
      expect(result).toBe(mockReturnValue);
      // Access mock results and verify it matches
      const mockResults = plantApiService.searchPlants.mock.results;
      expect(mockResults).toHaveLength(1);
      await expect(mockResults[0].value).resolves.toBe(mockReturnValue);
    });
  });
});
