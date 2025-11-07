import AsyncStorage from '@react-native-async-storage/async-storage';

const PLANTS_KEY = '@plants';
const TASKS_KEY = '@tasks';
const COUNTER_KEY = '@counter';

/**
 * Get next unique ID
 */
async function getNextId() {
  try {
    const counter = await AsyncStorage.getItem(COUNTER_KEY);
    const nextId = counter ? parseInt(counter) + 1 : 1;
    await AsyncStorage.setItem(COUNTER_KEY, nextId.toString());
    return nextId;
  } catch (error) {
    console.error('Error generating ID:', error);
    // Fallback to timestamp-based ID
    return Date.now();
  }
}

/**
 * Storage service for managing plants and tasks using AsyncStorage
 */
export const storageService = {
  /**
   * Get all plants
   * @returns {Promise<Array>} Array of plant objects
   */
  async getPlants() {
    try {
      const data = await AsyncStorage.getItem(PLANTS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading plants:', error);
      return [];
    }
  },

  /**
   * Save plants array
   * @param {Array} plants - Array of plant objects
   */
  async savePlants(plants) {
    try {
      await AsyncStorage.setItem(PLANTS_KEY, JSON.stringify(plants));
    } catch (error) {
      console.error('Error saving plants:', error);
      throw error;
    }
  },

  /**
   * Add a new plant
   * @param {Object} plant - Plant object
   * @returns {Promise<Object>} The added plant with generated ID
   */
  async addPlant(plant) {
    try {
      const plants = await this.getPlants();
      const newPlant = {
        ...plant,
        id: await getNextId(),
        createdAt: new Date().toISOString(),
      };
      plants.push(newPlant);
      await this.savePlants(plants);
      return newPlant;
    } catch (error) {
      console.error('Error adding plant:', error);
      throw error;
    }
  },

  /**
   * Update a plant
   * @param {number} id - Plant ID
   * @param {Object} updates - Fields to update
   */
  async updatePlant(id, updates) {
    try {
      const plants = await this.getPlants();
      const index = plants.findIndex(p => p.id === id);
      if (index !== -1) {
        plants[index] = { ...plants[index], ...updates };
        await this.savePlants(plants);
      }
    } catch (error) {
      console.error('Error updating plant:', error);
      throw error;
    }
  },

  /**
   * Delete a plant
   * @param {number} id - Plant ID
   */
  async deletePlant(id) {
    try {
      const plants = await this.getPlants();
      const filtered = plants.filter(p => p.id !== id);
      await this.savePlants(filtered);
      
      // Also delete associated tasks
      const tasks = await this.getTasks();
      const filteredTasks = tasks.filter(t => t.plantId !== id);
      await this.saveTasks(filteredTasks);
    } catch (error) {
      console.error('Error deleting plant:', error);
      throw error;
    }
  },

  /**
   * Get all tasks
   * @returns {Promise<Array>} Array of task objects
   */
  async getTasks() {
    try {
      const data = await AsyncStorage.getItem(TASKS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading tasks:', error);
      return [];
    }
  },

  /**
   * Save tasks array
   * @param {Array} tasks - Array of task objects
   */
  async saveTasks(tasks) {
    try {
      await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
    } catch (error) {
      console.error('Error saving tasks:', error);
      throw error;
    }
  },

  /**
   * Add a new task
   * @param {Object} task - Task object
   * @returns {Promise<Object>} The added task with generated ID
   */
  async addTask(task) {
    try {
      const tasks = await this.getTasks();
      const newTask = {
        ...task,
        id: await getNextId(),
        createdAt: new Date().toISOString(),
      };
      tasks.push(newTask);
      await this.saveTasks(tasks);
      return newTask;
    } catch (error) {
      console.error('Error adding task:', error);
      throw error;
    }
  },

  /**
   * Update a task
   * @param {number} id - Task ID
   * @param {Object} updates - Fields to update
   */
  async updateTask(id, updates) {
    try {
      const tasks = await this.getTasks();
      const index = tasks.findIndex(t => t.id === id);
      if (index !== -1) {
        tasks[index] = { ...tasks[index], ...updates };
        await this.saveTasks(tasks);
      }
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  },

  /**
   * Complete a task and schedule next occurrence
   * @param {number} taskId - Task ID
   */
  async completeTask(taskId) {
    try {
      const tasks = await this.getTasks();
      const task = tasks.find(t => t.id === taskId);
      
      if (task && task.repeatInterval) {
        const now = new Date();
        const nextDueDate = new Date(now);
        nextDueDate.setDate(nextDueDate.getDate() + task.repeatInterval.value);
        
        await this.updateTask(taskId, {
          lastCompletedAt: now.toISOString(),
          nextDueDate: nextDueDate.toISOString(),
        });
      }
    } catch (error) {
      console.error('Error completing task:', error);
      throw error;
    }
  },

  /**
   * Get tasks for a specific plant
   * @param {number} plantId - Plant ID
   * @returns {Promise<Array>} Array of task objects
   */
  async getTasksForPlant(plantId) {
    try {
      const tasks = await this.getTasks();
      return tasks.filter(t => t.plantId === plantId);
    } catch (error) {
      console.error('Error loading tasks for plant:', error);
      return [];
    }
  },

  /**
   * Clear all data (for testing/reset purposes)
   */
  async clearAll() {
    try {
      await AsyncStorage.multiRemove([PLANTS_KEY, TASKS_KEY, COUNTER_KEY]);
    } catch (error) {
      console.error('Error clearing data:', error);
      throw error;
    }
  },
};
