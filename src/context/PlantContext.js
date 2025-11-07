import React, { createContext, useState, useEffect, useContext } from 'react';
import { storageService } from '../services/storageService';
import { notificationService } from '../services/notificationService';

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

export const PlantProvider = ({ children }) => {
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

  const addPlant = async (plantData) => {
    try {
      const newPlant = await storageService.addPlant(plantData);
      setPlants(prev => [...prev, newPlant]);
      
      // Create default water task for the plant
      if (plantData.wateringGeneralBenchmark) {
        const intervalDays = parseWateringInterval(plantData.wateringGeneralBenchmark.value);
        const nextDueDate = new Date(Date.now() + intervalDays * 24 * 60 * 60 * 1000);
        
        const waterTask = {
          plantId: newPlant.id,
          type: 'Water',
          title: `Water ${plantData.name}`,
          repeatInterval: {
            value: intervalDays,
            unit: 'days',
          },
          nextDueDate: nextDueDate.toISOString(),
        };
        const createdTask = await addTask(waterTask);

        // Schedule notification with actual task ID
        await notificationService.scheduleWateringNotification({
          plantName: plantData.name,
          plantImage: plantData.imageUri,
          triggerDate: nextDueDate,
          taskId: createdTask.id,
        });
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
      setPlants(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    } catch (error) {
      console.error('Error updating plant:', error);
      throw error;
    }
  };

  const deletePlant = async (id) => {
    try {
      await storageService.deletePlant(id);
      setPlants(prev => prev.filter(p => p.id !== id));
      setTasks(prev => prev.filter(t => t.plantId !== id));
      // Note: Notifications will be rescheduled on next app start
    } catch (error) {
      console.error('Error deleting plant:', error);
      throw error;
    }
  };

  const addTask = async (taskData) => {
    try {
      const newTask = await storageService.addTask(taskData);
      setTasks(prev => [...prev, newTask]);
      return newTask;
    } catch (error) {
      console.error('Error adding task:', error);
      throw error;
    }
  };

  const updateTask = async (id, updates) => {
    try {
      await storageService.updateTask(id, updates);
      setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  };

  const completeTask = async (taskId) => {
    try {
      await storageService.completeTask(taskId);
      // Reload tasks to get updated data
      const updatedTasks = await storageService.getTasks();
      setTasks(updatedTasks);
      
      // Reschedule notification for the updated task
      const task = updatedTasks.find(t => t.id === taskId);
      if (task && task.nextDueDate) {
        const plant = plants.find(p => p.id === task.plantId);
        if (plant) {
          await notificationService.scheduleWateringNotification({
            plantName: plant.name,
            plantImage: plant.imageUri,
            triggerDate: new Date(task.nextDueDate),
            taskId: task.id,
          });
        }
      }
    } catch (error) {
      console.error('Error completing task:', error);
      throw error;
    }
  };

  const getTasksForPlant = (plantId) => {
    return tasks.filter(t => t.plantId === plantId);
  };

  const getUpcomingTasks = () => {
    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    
    return tasks
      .filter(t => {
        if (!t.nextDueDate) return false;
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
  };

  return (
    <PlantContext.Provider value={value}>
      {children}
    </PlantContext.Provider>
  );
};

export const usePlants = () => {
  const context = useContext(PlantContext);
  if (!context) {
    throw new Error('usePlants must be used within a PlantProvider');
  }
  return context;
};
