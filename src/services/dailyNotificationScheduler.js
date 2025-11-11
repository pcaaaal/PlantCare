import * as Notifications from 'expo-notifications';
import {notificationService} from './notificationService';
import {storageService} from './storageService';

/**
 * Daily Notification Scheduler
 * Schedules notifications for tasks due today at 18:00
 * This ensures push notifications are sent even when the app is closed
 */
export const dailyNotificationScheduler = {
  /**
   * Schedule notifications for all tasks due today
   * Should be called on app startup
   */
  async scheduleNotificationsForToday() {
    try {
      // Request permissions first
      const hasPermission = await notificationService.requestPermissions();
      if (!hasPermission) {
        console.log('No notification permission, skipping scheduling');
        return;
      }

      // Cancel all existing scheduled notifications to avoid duplicates
      await notificationService.cancelAllNotifications();
      console.log('Cleared all existing notifications');

      // Get all tasks
      const tasks = await storageService.getTasks();
      const plants = await storageService.getPlants();
      
      // Filter tasks that are not completed and have a due date
      const pendingTasks = tasks.filter(task => !task.completed && task.nextDueDate);
      
      console.log(`Found ${pendingTasks.length} pending tasks`);

      // Schedule notifications for each pending task
      let scheduledCount = 0;
      for (const task of pendingTasks) {
        const plant = plants.find(p => p.id === task.plantId);
        if (!plant) continue;

        const dueDate = new Date(task.nextDueDate);
        
        // Schedule notification for 18:00 on the due date
        const notificationId = await notificationService.scheduleWateringNotification({
          plantName: plant.name,
          plantImage: plant.image,
          triggerDate: dueDate,
          taskId: task.id,
        });

        if (notificationId) {
          scheduledCount++;
          console.log(`Scheduled notification for ${plant.name} on ${dueDate.toLocaleDateString()}`);
        }
      }

      console.log(`Successfully scheduled ${scheduledCount} notifications`);
      
      // Log all scheduled notifications for debugging
      const allScheduled = await notificationService.getAllScheduledNotifications();
      console.log(`Total scheduled notifications: ${allScheduled.length}`);
      
      return scheduledCount;
    } catch (error) {
      console.error('Error scheduling daily notifications:', error);
      return 0;
    }
  },

  /**
   * Re-schedule all notifications
   * Useful when tasks are added/updated/completed
   */
  async rescheduleAll() {
    console.log('Re-scheduling all notifications...');
    return await this.scheduleNotificationsForToday();
  },
};
