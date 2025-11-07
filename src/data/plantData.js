/**
 * Common plant names and their care requirements
 */
export const commonPlants = [
  {
    name: 'Monstera',
    scientificName: ['Monstera deliciosa'],
    watering: 'Average',
    wateringGeneralBenchmark: { value: '7-10', unit: 'days' },
    sunlight: ['Partial shade'],
    description: 'Popular tropical plant with iconic split leaves. Easy to care for.',
  },
  {
    name: 'Rose',
    scientificName: ['Rosa'],
    watering: 'Average',
    wateringGeneralBenchmark: { value: '3-5', unit: 'days' },
    sunlight: ['Full sun'],
    description: 'Classic flowering plant that needs regular watering and full sun.',
  },
  {
    name: 'Daisy',
    scientificName: ['Bellis perennis'],
    watering: 'Average',
    wateringGeneralBenchmark: { value: '3-4', unit: 'days' },
    sunlight: ['Full sun', 'Part shade'],
    description: 'Cheerful flowers that prefer moist soil and sunny locations.',
  },
  {
    name: 'Lilac',
    scientificName: ['Syringa'],
    watering: 'Average',
    wateringGeneralBenchmark: { value: '7-10', unit: 'days' },
    sunlight: ['Full sun'],
    description: 'Fragrant flowering shrub that blooms in spring.',
  },
  {
    name: 'Aster',
    scientificName: ['Aster'],
    watering: 'Average',
    wateringGeneralBenchmark: { value: '5-7', unit: 'days' },
    sunlight: ['Full sun', 'Part shade'],
    description: 'Late-blooming perennials with daisy-like flowers.',
  },
  {
    name: 'Iris',
    scientificName: ['Iris'],
    watering: 'Minimum',
    wateringGeneralBenchmark: { value: '7-10', unit: 'days' },
    sunlight: ['Full sun', 'Part shade'],
    description: 'Elegant flowering plant with sword-like leaves.',
  },
  {
    name: 'Cactus',
    scientificName: ['Cactaceae'],
    watering: 'Minimum',
    wateringGeneralBenchmark: { value: '14-21', unit: 'days' },
    sunlight: ['Full sun'],
    description: 'Cacti can grow for a long time without water. Common cactus found in dry areas (deserts).',
  },
  {
    name: 'Bonsai',
    scientificName: ['Various'],
    watering: 'Frequent',
    wateringGeneralBenchmark: { value: '2-3', unit: 'days' },
    sunlight: ['Partial shade'],
    description: 'Miniature trees requiring careful watering and pruning.',
  },
  {
    name: 'Succulent',
    scientificName: ['Various'],
    watering: 'Minimum',
    wateringGeneralBenchmark: { value: '10-14', unit: 'days' },
    sunlight: ['Full sun', 'Part shade'],
    description: 'Water-storing plants that need infrequent watering.',
  },
  {
    name: 'Fern',
    scientificName: ['Pteridophyta'],
    watering: 'Frequent',
    wateringGeneralBenchmark: { value: '3-4', unit: 'days' },
    sunlight: ['Partial shade'],
    description: 'Shade-loving plants that prefer consistently moist soil.',
  },
  {
    name: 'Snake Plant',
    scientificName: ['Dracaena trifasciata'],
    watering: 'Minimum',
    wateringGeneralBenchmark: { value: '14-21', unit: 'days' },
    sunlight: ['Low to bright indirect'],
    description: 'Low-maintenance plant that tolerates neglect and low light.',
  },
  {
    name: 'Pothos',
    scientificName: ['Epipremnum aureum'],
    watering: 'Average',
    wateringGeneralBenchmark: { value: '7-10', unit: 'days' },
    sunlight: ['Low to bright indirect'],
    description: 'Easy-care trailing plant perfect for beginners.',
  },
  {
    name: 'Peace Lily',
    scientificName: ['Spathiphyllum'],
    watering: 'Average',
    wateringGeneralBenchmark: { value: '5-7', unit: 'days' },
    sunlight: ['Low to medium indirect'],
    description: 'Air-purifying plant with elegant white flowers.',
  },
  {
    name: 'Aloe Vera',
    scientificName: ['Aloe barbadensis miller'],
    watering: 'Minimum',
    wateringGeneralBenchmark: { value: '14-21', unit: 'days' },
    sunlight: ['Bright indirect'],
    description: 'Medicinal succulent with healing gel in its leaves.',
  },
  {
    name: 'Spider Plant',
    scientificName: ['Chlorophytum comosum'],
    watering: 'Average',
    wateringGeneralBenchmark: { value: '5-7', unit: 'days' },
    sunlight: ['Bright indirect'],
    description: 'Resilient plant that produces baby plantlets.',
  },
];

/**
 * Search plants by name
 * @param {string} query - Search query
 * @returns {Array} Filtered plant array
 */
export const searchPlants = (query) => {
  if (!query || query.trim() === '') {
    return commonPlants;
  }
  
  const lowerQuery = query.toLowerCase();
  return commonPlants.filter(plant => 
    plant.name.toLowerCase().includes(lowerQuery) ||
    plant.scientificName.some(name => name.toLowerCase().includes(lowerQuery))
  );
};

/**
 * Get plant by name
 * @param {string} name - Plant name
 * @returns {Object|null} Plant object or null
 */
export const getPlantByName = (name) => {
  return commonPlants.find(plant => 
    plant.name.toLowerCase() === name.toLowerCase()
  ) || null;
};
