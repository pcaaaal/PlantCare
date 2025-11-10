import React, {createContext, useState, useEffect, useContext} from 'react';
import {storageService} from '../services/storageService';
import {notificationService} from '../services/notificationService';
import {plantApiService} from '../services/plantApiService';

const PlantContext = createContext();

/**
 * Parse watering interval from benchmark value
 * @param {string} value - Value like "7-10" or "7"
 * @returns {number} Interval in days
 */
function parseWateringInterval(value) {
	if (!value) return 7; // Default to 7 days
	if (typeof value !== 'string') return parseInt(value) || 7;

	// If value contains a dash, take the first number
	if (value.includes('-')) {
		const first = value.split('-')[0];
		return parseInt(first) || 7;
	}

	return parseInt(value) || 7;
}

export const PlantProvider = ({children}) => {
	const [plants, setPlants] = useState([]);
	const [tasks, setTasks] = useState([]);
	const [loading, setLoading] = useState(true);

	// Load data on mount
	useEffect(() => {
		loadData();
		initializeNotifications();
	}, []);

	const initializeNotifications = async () => {
		await notificationService.requestPermissions();
	};

	const loadData = async () => {
		try {
			setLoading(true);
			const [loadedPlants, loadedTasks] = await Promise.all([
				storageService.getPlants(),
				storageService.getTasks(),
			]);
			setPlants(loadedPlants);
			setTasks(loadedTasks);
		} catch (error) {
			console.error('Error loading data:', error);
		} finally {
			setLoading(false);
		}
	};

	/**
	 * Search plant catalog from API
	 * @param {string} query - Search query
	 * @returns {Promise<Array>} Array of plant search results
	 */
	const searchPlantCatalog = async (query) => {
		try {
			if (!query || query.trim() === '') {
				return [];
			}
			const results = await plantApiService.searchPlants(query);
			return results;
		} catch (error) {
			console.error('Error searching plant catalog:', error);
			// Return empty array on error, allowing user to proceed without API data
			return [];
		}
	};

	/**
	 * Get detailed plant information from API
	 * @param {number} plantId - Plant ID from API
	 * @returns {Promise<Object>} Detailed plant data
	 */
	const getPlantDetails = async (plantId) => {
		try {
			const details = await plantApiService.getPlantDetails(plantId);
			return details;
		} catch (error) {
			console.error('Error fetching plant details:', error);
			throw error;
		}
	};

	const addPlant = async (plantData) => {
		try {
			// Validate required fields
			if (!plantData.name) {
				throw new Error('Plant name is required');
			}

			const newPlant = await storageService.addPlant(plantData);
			setPlants((prev) => [...prev, newPlant]);

			// Create water tasks for the next 3 months
			if (plantData.wateringGeneralBenchmark) {
				const intervalDays = parseWateringInterval(
					plantData.wateringGeneralBenchmark.value,
				);
				const today = new Date();
				today.setHours(18, 0, 0, 0);
				const startDate = today.toISOString();
				
				// Generate tasks for the next 3 months
				const threeMonthsInDays = 90; // Approximately 3 months
				const numberOfTasks = Math.ceil(threeMonthsInDays / intervalDays);
				
				for (let i = 0; i < numberOfTasks; i++) {
					const dueDate = new Date(today);
					dueDate.setDate(dueDate.getDate() + (i * intervalDays));
					dueDate.setHours(18, 0, 0, 0);
					
					const waterTask = {
						plantId: newPlant.id,
						type: 'Water',
						title: `Water ${plantData.name}`,
						intervalDays: intervalDays,
						nextDueDate: dueDate.toISOString(),
						startDate: startDate,
						completed: false,
					};
					const createdTask = await addTask(waterTask);

					// Schedule notification for the first task only
					if (i === 0) {
						await notificationService.scheduleWateringNotification({
							plantName: plantData.name,
							plantImage: plantData.imageUri,
							triggerDate: dueDate,
							taskId: createdTask.id,
						});
					}
				}
			}

			return newPlant;
		} catch (error) {
			console.error('Error adding plant:', error);
			throw error;
		}
	};

	const updatePlant = async (id, updates) => {
		try {
			await storageService.updatePlant(id, updates);
			setPlants((prev) =>
				prev.map((p) => (p.id === id ? {...p, ...updates} : p)),
			);
		} catch (error) {
			console.error('Error updating plant:', error);
			throw error;
		}
	};

	const deletePlant = async (id) => {
		try {
			await storageService.deletePlant(id);
			setPlants((prev) => prev.filter((p) => p.id !== id));
			setTasks((prev) => prev.filter((t) => t.plantId !== id));
			// Note: Notifications will be rescheduled on next app start
		} catch (error) {
			console.error('Error deleting plant:', error);
			throw error;
		}
	};

	const addTask = async (taskData) => {
		try {
			const newTask = await storageService.addTask(taskData);
			setTasks((prev) => [...prev, newTask]);
			return newTask;
		} catch (error) {
			console.error('Error adding task:', error);
			throw error;
		}
	};

	const updateTask = async (id, updates) => {
		try {
			await storageService.updateTask(id, updates);
			setTasks((prev) =>
				prev.map((t) => (t.id === id ? {...t, ...updates} : t)),
			);
		} catch (error) {
			console.error('Error updating task:', error);
			throw error;
		}
	};

	const completeTask = async (taskId) => {
		try {
			// Get the task before marking it complete
			const currentTasks = await storageService.getTasks();
			const task = currentTasks.find((t) => t.id === taskId);
			
			if (!task) {
				throw new Error('Task not found');
			}

			// Mark task as completed
			await storageService.updateTask(taskId, {
				completed: true,
				completedAt: new Date().toISOString(),
			});

			// Create a new task based on the watering interval
			if (task.intervalDays) {
				const plant = plants.find((p) => p.id === task.plantId);
				if (plant) {
					// Find the last (latest) non-completed task for this plant
					const plantTasks = currentTasks.filter(
						t => t.plantId === task.plantId && 
						!t.completed && 
						t.id !== taskId &&
						t.nextDueDate
					);
					
					// Sort by due date to find the latest
					plantTasks.sort((a, b) => 
						new Date(b.nextDueDate) - new Date(a.nextDueDate)
					);
					
					const lastTask = plantTasks[0];
					
					// Calculate next due date based on the last task or the completed task
					let nextDueDate;
					if (lastTask) {
						// Add intervalDays to the last task's due date
						nextDueDate = new Date(lastTask.nextDueDate);
						nextDueDate.setDate(nextDueDate.getDate() + task.intervalDays);
					} else {
						// No other tasks exist, add intervalDays to completed task's due date
						nextDueDate = new Date(task.nextDueDate);
						nextDueDate.setDate(nextDueDate.getDate() + task.intervalDays);
					}
					nextDueDate.setHours(18, 0, 0, 0);

					const newTask = {
						plantId: task.plantId,
						type: task.type,
						title: task.title,
						intervalDays: task.intervalDays,
						nextDueDate: nextDueDate.toISOString(),
						startDate: task.startDate || new Date().toISOString(),
						completed: false,
					};
					const createdTask = await addTask(newTask);

					// Schedule notification for the new task
					await notificationService.scheduleWateringNotification({
						plantName: plant.name,
						plantImage: plant.imageUri,
						triggerDate: nextDueDate,
						taskId: createdTask.id,
					});
				}
			}

			// Reload tasks to get updated data
			const updatedTasks = await storageService.getTasks();
			setTasks(updatedTasks);
		} catch (error) {
			console.error('Error completing task:', error);
			throw error;
		}
	};

  const getTasksForPlant = (plantId) => {
    return tasks.filter(t => t.plantId === plantId && !t.completed);
  };

  const getUpcomingTasks = () => {
    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    
    return tasks
      .filter(t => {
        if (!t.nextDueDate || t.completed) return false;
        const dueDate = new Date(t.nextDueDate);
        return dueDate <= threeDaysFromNow;
      })
      .sort((a, b) => new Date(a.nextDueDate) - new Date(b.nextDueDate));
  };

	const value = {
		plants,
		tasks,
		loading,
		addPlant,
		updatePlant,
		deletePlant,
		addTask,
		updateTask,
		completeTask,
		getTasksForPlant,
		getUpcomingTasks,
		refreshData: loadData,
		searchPlantCatalog,
		getPlantDetails,
	};

	return (
		<PlantContext.Provider value={value}>{children}</PlantContext.Provider>
	);
};

export const usePlants = () => {
	const context = useContext(PlantContext);
	if (!context) {
		throw new Error('usePlants must be used within a PlantProvider');
	}
	return context;
};
