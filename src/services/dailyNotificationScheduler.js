import * as Notifications from 'expo-notifications';
import {notificationService} from './notificationService';
import {storageService} from './storageService';

/**
 * Daily Notification Scheduler
 * Schedules notifications for all pending tasks at 18:00 on their due dates
 * This ensures push notifications are sent even when the app is closed
 * 
 * NOTE: Despite the misleading function name, this schedules notifications for
 * ALL pending tasks (not just today), which can span weeks or months into the future.
 * Once scheduled, notifications will fire at 18:00 on their due dates without
 * requiring the app to be opened.
 */
export const dailyNotificationScheduler = {
  /**
   * Schedule notifications for all pending tasks at 18:00 on their due dates
   * Should be called on app startup to ensure all notifications are up-to-date
   * 
   * This schedules notifications for ALL pending tasks, not just today's tasks.
   * For example, if you have tasks due over the next 3 months, all notifications
   * will be scheduled at once and will fire at 18:00 on their respective dates
   * even if the app is never opened again.
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
      
      console.log(`Found ${pendingTasks.length} pending tasks to schedule notifications for`);

      // Schedule notifications for each pending task at 18:00 on their due dates
      // These notifications will fire even if the app is closed
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
