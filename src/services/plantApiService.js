import Constants from 'expo-constants';

const API_KEY = Constants.expoConfig?.extra?.perenualApiKey;
const API_URL = Constants.expoConfig?.extra?.perenualApiUrl;
const MAX_FREE_TIER_ID = 3000;

/**
 * Plant API service for fetching plant data from Perenual API
 */
export const plantApiService = {
	/**
	 * Search for plants by name
	 * @param {string} query - Search query (plant name)
	 * @param {number} page - Page number (default: 1)
	 * @returns {Promise<Array>} Array of plant objects
	 */
	async searchPlants(query, page = 1) {
		if (!query || query.trim() === '') {
			return [];
		}

		try {
			const url = `${API_URL}/species-list?q=${encodeURIComponent(
				query,
			)}&page=${page}&key=${API_KEY}`;

			console.log('Fetching plants from URL:', url);
			const response = await fetch(url);

			if (!response.ok) {
				throw new Error(
					`API request failed with status ${response.status}`,
				);
			}

			const data = await response.json();

			// Filter out plants with ID >= 3000 (free tier limitation)
			const filteredPlants = (data.data || []).filter(
				(plant) => plant.id < MAX_FREE_TIER_ID,
			);

			// Map API response to our app's format
			return filteredPlants.map((plant) => ({
				id: plant.id,
				name: plant.common_name,
				scientificName: plant.scientific_name || [],
				family: plant.family,
				imageUrl:
					plant.default_image?.thumbnail ||
					plant.default_image?.small_url,
			}));
		} catch (error) {
			console.error('Error searching plants:', error);
			throw error;
		}
	},

	/**
	 * Get detailed information about a specific plant
	 * @param {number} plantId - Plant ID from search results
	 * @returns {Promise<Object>} Detailed plant object
	 */
	async getPlantDetails(plantId) {
		if (!plantId || plantId >= MAX_FREE_TIER_ID) {
			throw new Error(
				'Invalid plant ID or ID not available in free tier',
			);
		}

		try {
			const url = `${API_URL}/species/details/${plantId}?key=${API_KEY}`;
			const response = await fetch(url);

			if (!response.ok) {
				throw new Error(
					`API request failed with status ${response.status}`,
				);
			}

			const data = await response.json();

			// Map API response to our app's format
			return {
				id: data.id,
				name: data.common_name,
				scientificName: data.scientific_name || [],
				watering: data.watering,
				wateringGeneralBenchmark: data.watering_general_benchmark
					? {
							value:
								data.watering_general_benchmark.value?.replace(
									/"/g,
									'',
								) || '7',
							unit:
								data.watering_general_benchmark.unit || 'days',
					  }
					: {value: '7', unit: 'days'},
				sunlight: data.sunlight || [],
				description: data.description,
				type: data.type,
				cycle: data.cycle,
				careLevel: data.care_level,
			};
		} catch (error) {
			console.error('Error fetching plant details:', error);
			throw error;
		}
	},
};
