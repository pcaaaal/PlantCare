import { storageService } from '../services/storageService';

/**
 * Parse watering interval from benchmark value
 * @param {string|number} value - Value like "7-10" or "7"
 * @returns {number} Interval in days
 */
function parseWateringInterval(value) {
  if (!value) return 7; // Default to 7 days
  if (typeof value === 'number') return value;
  if (typeof value !== 'string') return 7;
  
  // If value contains a dash, take the first number
  if (value.includes('-')) {
    const first = value.split('-')[0];
    return parseInt(first) || 7;
  }
  
  return parseInt(value) || 7;
}

/**
 * Initialize the app with sample data for testing
 * This is useful for development and demo purposes
 */
export const initializeSampleData = async () => {
  try {
    // Check if there's already data
    const existingPlants = await storageService.getPlants();
    if (existingPlants.length > 0) {
      console.log('Sample data already exists, skipping initialization');
      return false;
    }

    console.log('Initializing sample data...');

    // Sample plants
    const samplePlants = [
      {
        name: 'Cactus',
        scientificName: ['Cactaceae'],
        watering: 'Minimum',
        wateringGeneralBenchmark: { value: '14-21', unit: 'days' },
        sunlight: ['Full sun'],
        description: 'Cacti can grow for a long time without water. Common cactus found in dry areas (deserts). The plural word for cactus is kakti.',
        imageUri: null,
      },
      {
        name: 'Bonsai',
        scientificName: ['Various'],
        watering: 'Frequent',
        wateringGeneralBenchmark: { value: '2-3', unit: 'days' },
        sunlight: ['Partial shade'],
        description: 'Miniature trees requiring careful watering and pruning.',
        imageUri: null,
      },
      {
        name: 'Monstera',
        scientificName: ['Monstera deliciosa'],
        watering: 'Average',
        wateringGeneralBenchmark: { value: '7-10', unit: 'days' },
        sunlight: ['Partial shade'],
        description: 'Popular tropical plant with iconic split leaves. Easy to care for.',
        imageUri: null,
      },
    ];

    // Add sample plants
    for (const plantData of samplePlants) {
      const plant = await storageService.addPlant(plantData);
      
      // Create watering task
      const intervalDays = parseWateringInterval(plantData.wateringGeneralBenchmark?.value);
      const nextDueDate = new Date();
      
      // Set different due dates for variety
      if (plantData.name === 'Cactus') {
        nextDueDate.setDate(nextDueDate.getDate() + 5);
      } else if (plantData.name === 'Bonsai') {
        nextDueDate.setDate(nextDueDate.getDate() + 1); // Due soon
      } else {
        nextDueDate.setDate(nextDueDate.getDate() + 2);
      }

      await storageService.addTask({
        plantId: plant.id,
        type: 'Water',
        title: `Water ${plantData.name}`,
        repeatInterval: {
          value: intervalDays,
          unit: 'days',
        },
        nextDueDate: nextDueDate.toISOString(),
      });

      // Add some additional tasks
      if (plantData.name === 'Bonsai') {
        const pruneDate = new Date();
        pruneDate.setDate(pruneDate.getDate() + 7);
        await storageService.addTask({
          plantId: plant.id,
          type: 'Prune',
          title: 'Prune The Dead Branches',
          repeatInterval: {
            value: 30,
            unit: 'days',
          },
          nextDueDate: pruneDate.toISOString(),
        });
      }

      if (plantData.name === 'Monstera') {
        const lightDate = new Date();
        lightDate.setDate(lightDate.getDate() + 1);
        await storageService.addTask({
          plantId: plant.id,
          type: 'Light',
          title: 'Light',
          repeatInterval: {
            value: 7,
            unit: 'days',
          },
          nextDueDate: lightDate.toISOString(),
        });
      }
    }

    console.log('Sample data initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing sample data:', error);
    return false;
  }
};

/**
 * Clear all data and reinitialize with sample data
 */
export const resetWithSampleData = async () => {
  try {
    await storageService.clearAll();
    await initializeSampleData();
    return true;
  } catch (error) {
    console.error('Error resetting with sample data:', error);
    return false;
  }
};
