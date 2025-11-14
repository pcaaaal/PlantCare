import React, {createContext, useState, useEffect, useContext} from 'react';
import {storageService} from '../services/storageService';
import {notificationService} from '../services/notificationService';
import {plantApiService} from '../services/plantApiService';

const PlantContext = createContext();

const DEFAULT_NOTIFICATION_HOUR = 11;
const DEFAULT_NOTIFICATION_MINUTE = 30;

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

/**
 * Calculate next notification date at 6 PM
 * Ensures the date is at least 2 minutes in the future
 * @param {Date} baseDate - Base date to calculate from
 * @returns {Date} Next valid notification date
 */
function getNextNotificationDate(baseDate = new Date()) {
	const notificationDate = new Date(baseDate);
	notificationDate.setHours(
		DEFAULT_NOTIFICATION_HOUR,
		DEFAULT_NOTIFICATION_MINUTE,
		0,
		0,
	);

	const now = new Date();
	const twoMinutesFromNow = new Date(now.getTime() + 2 * 60 * 1000);

	// If the notification time has passed or is too soon, move to next day
	if (notificationDate < twoMinutesFromNow) {
		notificationDate.setDate(notificationDate.getDate() + 1);
	}

	return notificationDate;
}

/**
 * Generate task dates for the next N months
 * @param {number} intervalDays - Days between each task
 * @param {number} months - Number of months to generate (default 3)
 * @returns {Array<Date>} Array of task dates
 */
function generateTaskDates(intervalDays, months = 3) {
	const dates = [];
	const startDate = getNextNotificationDate();
	const daysToGenerate = months * 30; // Approximate days
	const numberOfTasks = Math.ceil(daysToGenerate / intervalDays);

	for (let i = 0; i < numberOfTasks; i++) {
		const taskDate = new Date(startDate);
		taskDate.setDate(taskDate.getDate() + i * intervalDays);
		dates.push(taskDate);
	}

	return dates;
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
		const hasPermission = await notificationService.requestPermissions();
		if (hasPermission) {
			console.log('Notification permissions granted');
		}
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

	/**
	 * Add a new plant and create its watering tasks with notifications
	 */
	const addPlant = async (plantData) => {
		try {
			// Validate required fields
			if (!plantData.name) {
				throw new Error('Plant name is required');
			}

			const newPlant = await storageService.addPlant(plantData);
			setPlants((prev) => [...prev, newPlant]);

			// Create watering tasks for the next 3 months
			if (plantData.wateringGeneralBenchmark) {
				const intervalDays = parseWateringInterval(
					plantData.wateringGeneralBenchmark.value,
				);

				// Generate all task dates upfront
				const taskDates = generateTaskDates(intervalDays, 3);

				// Create tasks and schedule notifications
				const notificationParams = [];
				for (const taskDate of taskDates) {
					const waterTask = {
						plantId: newPlant.id,
						type: 'Water',
						title: `Water ${plantData.name}`,
						intervalDays: intervalDays,
						dueDate: taskDate.toISOString(),
						completed: false,
					};

					const newTask = await storageService.addTask(waterTask);
					setTasks((prev) => [...prev, newTask]);

					// Collect notification parameters
					notificationParams.push({
						plantName: plantData.name,
						triggerDate: taskDate,
						taskId: newTask.id,
					});
				}

				// Schedule all notifications at once
				await notificationService.scheduleMultipleNotifications(
					notificationParams,
				);
				console.log(
					`Created ${taskDates.length} tasks with notifications for ${plantData.name}`,
				);
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

	/**
	 * Delete a plant and all its associated tasks and notifications
	 */
	const deletePlant = async (id) => {
		try {
			// Get all tasks for this plant to cancel their notifications
			const plantTasks = tasks.filter((t) => t.plantId === id);

			// Cancel notifications (if you store notificationId in tasks)
			// Otherwise, cancel all notifications for safety and reschedule remaining
			await notificationService.cancelNotificationsForPlant(id);

			// Delete from storage
			await storageService.deletePlant(id);

			// Update state
			setPlants((prev) => prev.filter((p) => p.id !== id));
			setTasks((prev) => prev.filter((t) => t.plantId !== id));

			console.log(`Deleted plant ${id} and all associated tasks`);
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

	/**
	 * Complete a task and create the next one in the sequence
	 * Much simpler: just create one new task for the next interval
	 */
	const completeTask = async (taskId) => {
		try {
			const task = tasks.find((t) => t.id === taskId);

			if (!task) {
				throw new Error('Task not found');
			}

			// Mark task as completed
			await storageService.updateTask(taskId, {
				completed: true,
				completedAt: new Date().toISOString(),
			});

			// Update local state
			setTasks((prev) =>
				prev.map((t) =>
					t.id === taskId ? {...t, completed: true} : t,
				),
			);

			// Create next task if this is a recurring task
			if (task.intervalDays) {
				const plant = plants.find((p) => p.id === task.plantId);
				if (plant) {
					// Find the latest uncompleted task for this plant
					const plantTasks = tasks
						.filter(
							(t) =>
								t.plantId === task.plantId &&
								!t.completed &&
								t.id !== taskId,
						)
						.sort(
							(a, b) => new Date(b.dueDate) - new Date(a.dueDate),
						);

					// Calculate next due date
					let nextDueDate;
					if (plantTasks.length > 0) {
						// Add interval to the latest existing task
						nextDueDate = new Date(plantTasks[0].dueDate);
						nextDueDate.setDate(
							nextDueDate.getDate() + task.intervalDays,
						);
					} else {
						// No future tasks exist, create one based on current task
						nextDueDate = new Date(task.dueDate);
						nextDueDate.setDate(
							nextDueDate.getDate() + task.intervalDays,
						);
					}

					// Ensure it's at 9:45 AM
					nextDueDate.setHours(
						DEFAULT_NOTIFICATION_HOUR,
						DEFAULT_NOTIFICATION_MINUTE,
						0,
						0,
					);

					// Create the new task
					const newTask = {
						plantId: task.plantId,
						type: task.type,
						title: task.title,
						intervalDays: task.intervalDays,
						dueDate: nextDueDate.toISOString(),
						completed: false,
					};

					const createdTask = await storageService.addTask(newTask);
					setTasks((prev) => [...prev, createdTask]);

					// Schedule notification for the new task
					await notificationService.scheduleNotification({
						plantName: plant.name,
						triggerDate: nextDueDate,
						taskId: createdTask.id,
					});

					console.log(
						`Created next task for ${
							plant.name
						} due ${nextDueDate.toLocaleDateString()}`,
					);
				}
			}
		} catch (error) {
			console.error('Error completing task:', error);
			throw error;
		}
	};

	/**
	 * Get all uncompleted tasks for a specific plant
	 */
	const getTasksForPlant = (plantId) => {
		return tasks
			.filter((t) => t.plantId === plantId && !t.completed)
			.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
	};

	/**
	 * Get upcoming tasks (due in the next 7 days)
	 */
	const getUpcomingTasks = () => {
		const now = new Date();
		now.setHours(0, 0, 0, 0); // Start of today
		const sevenDaysFromNow = new Date(
			now.getTime() + 7 * 24 * 60 * 60 * 1000,
		);

		return tasks
			.filter((t) => {
				if (!t.dueDate || t.completed) return false;
				const dueDate = new Date(t.dueDate);
				return dueDate >= now && dueDate <= sevenDaysFromNow;
			})
			.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
	};

	/**
	 * Get overdue tasks
	 */
	const getOverdueTasks = () => {
		const now = new Date();
		now.setHours(0, 0, 0, 0);

		return tasks
			.filter((t) => {
				if (!t.dueDate || t.completed) return false;
				const dueDate = new Date(t.dueDate);
				return dueDate < now;
			})
			.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
	};

	/**
	 * Debug function to check scheduled notifications
	 */
	const debugNotifications = async () => {
		const scheduled =
			await notificationService.getAllScheduledNotifications();
		console.log('=== Scheduled Notifications ===');
		scheduled.forEach((n) => {
			console.log(
				`- ${n.content.title}: ${new Date(
					n.trigger.value,
				).toLocaleString()}`,
			);
		});
		console.log('==============================');
		return scheduled;
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
		getOverdueTasks,
		refreshData: loadData,
		searchPlantCatalog,
		getPlantDetails,
		debugNotifications,
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
