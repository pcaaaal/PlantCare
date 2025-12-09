/**
 * Mock class for plantApiService
 * 
 * This mock class demonstrates the use of a mock framework (Jest)
 * similar to Mockito in Java. It provides mock implementations
 * of all methods in the plantApiService.
 * 
 * Mock Framework: Jest (equivalent to Mockito for JavaScript)
 * Author: Timo Balsiger
 */

/**
 * Mock implementation of plantApiService
 * All methods are Jest mock functions that can be configured
 * and verified in tests, similar to Mockito's when().thenReturn()
 * and verify() patterns.
 */
export const plantApiService = {
	/**
	 * Mock for searchPlants method
	 * Default behavior: returns empty array
	 * Can be configured with mockResolvedValue() or mockResolvedValueOnce()
	 */
	searchPlants: jest.fn((query, page = 1) => {
		// Default mock behavior - returns empty array
		return Promise.resolve([]);
	}),

	/**
	 * Mock for getPlantDetails method
	 * Default behavior: returns a basic plant object
	 * Can be configured with mockResolvedValue() or mockResolvedValueOnce()
	 */
	getPlantDetails: jest.fn((plantId) => {
		// Default mock behavior - returns minimal plant object
		return Promise.resolve({
			id: plantId,
			name: 'Mock Plant',
			scientificName: ['Mock Scientific Name'],
			watering: 'Average',
			wateringGeneralBenchmark: {
				value: '7',
				unit: 'days',
			},
			sunlight: ['Full sun'],
			description: 'Mock plant description',
			type: 'Perennial',
			cycle: 'Evergreen',
			careLevel: 'Easy',
		});
	}),
};

/**
 * Helper function to reset all mocks
 * Similar to Mockito's reset() functionality
 */
export const resetMocks = () => {
	plantApiService.searchPlants.mockReset();
	plantApiService.getPlantDetails.mockReset();
};

/**
 * Helper function to clear all mock calls and instances
 * Similar to Mockito's clearInvocations()
 */
export const clearMocks = () => {
	plantApiService.searchPlants.mockClear();
	plantApiService.getPlantDetails.mockClear();
};

// Default export for module mocking
export default plantApiService;
