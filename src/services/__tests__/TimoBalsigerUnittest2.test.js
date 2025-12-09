/**
 * TimoBalsigerUnittest2 - Unit Tests for plantApiService
 * Author: Timo Balsiger
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

describe('TimoBalsigerUnittest2 - plantApiService', () => {
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

  /**
   * Test Suite 1: searchPlants Method
   * Tests the search functionality with various inputs including edge cases
   */
  describe('searchPlants', () => {
    /**
     * Test 1a: Normal case - successful search with valid results
     */
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
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('q=aloe')
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

    /**
     * Test 1b: Boundary case - empty query string
     */
    it('sollte ein leeres Array zurückgeben bei leerem Query-String', async () => {
      const result = await plantApiService.searchPlants('');
      
      expect(fetch).not.toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    /**
     * Test 1c: Boundary case - query with only whitespace
     */
    it('sollte ein leeres Array zurückgeben bei Query mit nur Leerzeichen', async () => {
      const result = await plantApiService.searchPlants('   ');
      
      expect(fetch).not.toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    /**
     * Test 1d: Boundary case - filter out plants with ID >= 3000
     */
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

    /**
     * Test 1e: Error case - API returns non-OK status
     */
    it('sollte einen Fehler werfen bei nicht-erfolgreicher API-Antwort', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      await expect(plantApiService.searchPlants('test')).rejects.toThrow(
        'API request failed with status 404'
      );
    });

    /**
     * Test 1f: Error case - network failure
     */
    it('sollte einen Fehler werfen bei Netzwerkfehler', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(plantApiService.searchPlants('test')).rejects.toThrow(
        'Network error'
      );
    });

    /**
     * Test 1g: Edge case - plants with missing image data
     */
    it('sollte Pflanzen ohne Bild-Daten korrekt verarbeiten', async () => {
      const mockResponse = {
        data: [
          {
            id: 1,
            common_name: 'Plant Without Image',
            scientific_name: [],
            family: 'TestFamily',
            default_image: null,
          },
        ],
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await plantApiService.searchPlants('test');

      expect(result).toHaveLength(1);
      expect(result[0].imageUrl).toBeUndefined();
    });

    /**
     * Test 1h: Edge case - pagination parameter
     */
    it('sollte Paginierungs-Parameter korrekt verarbeiten', async () => {
      const mockResponse = { data: [] };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await plantApiService.searchPlants('test', 5);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('page=5')
      );
    });
  });

  /**
   * Test Suite 2: getPlantDetails Method
   * Tests fetching detailed plant information with various inputs
   */
  describe('getPlantDetails', () => {
    /**
     * Test 2a: Normal case - successful fetch with complete data
     */
    it('sollte Pflanzen-Details erfolgreich abrufen und formatieren', async () => {
      const mockResponse = {
        id: 1,
        common_name: 'Aloe Vera',
        scientific_name: ['Aloe barbadensis'],
        watering: 'Minimal',
        watering_general_benchmark: {
          value: '"7-14"',
          unit: 'days',
        },
        sunlight: ['Full sun', 'Part shade'],
        description: 'A succulent plant species',
        type: 'Perennial',
        cycle: 'Evergreen',
        care_level: 'Easy',
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await plantApiService.getPlantDetails(1);

      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('species/details/1')
      );
      expect(result).toEqual({
        id: 1,
        name: 'Aloe Vera',
        scientificName: ['Aloe barbadensis'],
        watering: 'Minimal',
        wateringGeneralBenchmark: {
          value: '7-14',
          unit: 'days',
        },
        sunlight: ['Full sun', 'Part shade'],
        description: 'A succulent plant species',
        type: 'Perennial',
        cycle: 'Evergreen',
        careLevel: 'Easy',
      });
    });

    /**
     * Test 2b: Boundary case - plantId is 0 (falsy value)
     */
    it('sollte einen Fehler werfen bei plantId = 0', async () => {
      await expect(plantApiService.getPlantDetails(0)).rejects.toThrow(
        'Invalid plant ID or ID not available in free tier'
      );
      
      expect(fetch).not.toHaveBeenCalled();
    });

    /**
     * Test 2c: Boundary case - plantId is null
     */
    it('sollte einen Fehler werfen bei null plantId', async () => {
      await expect(plantApiService.getPlantDetails(null)).rejects.toThrow(
        'Invalid plant ID or ID not available in free tier'
      );
      
      expect(fetch).not.toHaveBeenCalled();
    });

    /**
     * Test 2d: Boundary case - plantId is undefined
     */
    it('sollte einen Fehler werfen bei undefined plantId', async () => {
      await expect(plantApiService.getPlantDetails(undefined)).rejects.toThrow(
        'Invalid plant ID or ID not available in free tier'
      );
      
      expect(fetch).not.toHaveBeenCalled();
    });

    /**
     * Test 2e: Boundary case - plantId >= 3000 (free tier limit)
     */
    it('sollte einen Fehler werfen bei plantId >= 3000', async () => {
      await expect(plantApiService.getPlantDetails(3000)).rejects.toThrow(
        'Invalid plant ID or ID not available in free tier'
      );
      
      await expect(plantApiService.getPlantDetails(5000)).rejects.toThrow(
        'Invalid plant ID or ID not available in free tier'
      );
      
      expect(fetch).not.toHaveBeenCalled();
    });

    /**
     * Test 2f: Boundary case - plantId exactly 2999 (valid boundary)
     */
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

    /**
     * Test 2g: Edge case - missing watering benchmark data
     */
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

    /**
     * Test 2h: Edge case - watering benchmark with quotes
     */
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

    /**
     * Test 2i: Error case - API returns 500 error
     */
    it('sollte einen Fehler werfen bei Server-Fehler (500)', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      await expect(plantApiService.getPlantDetails(1)).rejects.toThrow(
        'API request failed with status 500'
      );
    });

    /**
     * Test 2j: Error case - invalid JSON response
     */
    it('sollte einen Fehler werfen bei ungültiger JSON-Antwort', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error('Invalid JSON');
        },
      });

      await expect(plantApiService.getPlantDetails(1)).rejects.toThrow();
    });

    /**
     * Test 2k: Edge case - negative plantId
     * Note: The current implementation does not explicitly reject negative IDs
     * because the check is `!plantId || plantId >= MAX_FREE_TIER_ID`, and -1 is truthy.
     * This test documents that negative IDs will attempt an API call (and likely fail at the API level).
     */
    it('sollte negative plantId an die API weiterleiten (nicht blockiert)', async () => {
      const mockResponse = {
        id: -1,
        common_name: 'Test',
        scientific_name: [],
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      // Negative IDs are not blocked by the validation, so the API call proceeds
      await plantApiService.getPlantDetails(-1);
      
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('species/details/-1')
      );
    });
  });

  /**
   * Test Suite 3: Integration and Mock Verification
   * Tests that verify mock interactions and integration between methods
   */
  describe('Mock Framework Verification', () => {
    /**
     * Test 3a: Verify fetch is called with correct API key
     */
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

    /**
     * Test 3b: Verify URL encoding for special characters
     */
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

    /**
     * Test 3c: Verify mock reset between tests
     */
    it('sollte Mock-Aufrufe zwischen Tests zurücksetzen', () => {
      expect(fetch).not.toHaveBeenCalled();
    });

    /**
     * Test 3d: Verify console.log is called during API requests
     */
    it('sollte Logging-Aufrufe durchführen', async () => {
      const mockResponse = { data: [] };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await plantApiService.searchPlants('test');

      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('Fetching plants from URL:'),
        expect.any(String)
      );
    });
  });
});
