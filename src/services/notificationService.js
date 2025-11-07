import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

/**
 * Configure how notifications should be handled when app is in foreground
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Notification service for managing plant care reminders
 */
export const notificationService = {
  /**
   * Request notification permissions
   * @returns {Promise<boolean>} True if permission granted
   */
  async requestPermissions() {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.warn('Notification permission not granted');
        return false;
      }
      
      // Configure channel for Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Plant Care Reminders',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#4CAF50',
        });
      }
      
      return true;
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  },

  /**
   * Schedule a notification for watering reminder
   * @param {Object} params - Notification parameters
   * @param {string} params.plantName - Name of the plant
   * @param {string} params.plantImage - URI of plant image (optional)
   * @param {Date} params.triggerDate - When to trigger the notification
   * @param {number} params.taskId - Task ID for tracking
   * @returns {Promise<string>} Notification identifier
   */
  async scheduleWateringNotification({ plantName, plantImage, triggerDate, taskId }) {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        console.warn('Cannot schedule notification without permission');
        return null;
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '💧 Time to Water!',
          body: `Your ${plantName} needs watering today.`,
          data: { taskId, plantName },
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: {
          date: triggerDate,
        },
      });

      console.log('Notification scheduled:', notificationId);
      return notificationId;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return null;
    }
  },

  /**
   * Schedule repeating notification for a task
   * @param {Object} params - Notification parameters
   * @param {string} params.plantName - Name of the plant
   * @param {number} params.intervalDays - Days between notifications
   * @param {number} params.taskId - Task ID for tracking
   * @param {number} params.hour - Hour of day (0-23)
   * @param {number} params.minute - Minute (0-59)
   * @returns {Promise<string>} Notification identifier
   */
  async scheduleRepeatingNotification({ plantName, intervalDays, taskId, hour = 9, minute = 0 }) {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        console.warn('Cannot schedule notification without permission');
        return null;
      }

      // Calculate seconds until next trigger
      const now = new Date();
      const trigger = new Date();
      trigger.setHours(hour, minute, 0, 0);
      
      // If time has passed today, start from tomorrow
      if (trigger <= now) {
        trigger.setDate(trigger.getDate() + intervalDays);
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '💧 Time to Water!',
          body: `Your ${plantName} needs watering today.`,
          data: { taskId, plantName },
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: {
          seconds: Math.floor((trigger - now) / 1000),
          repeats: true,
        },
      });

      console.log('Repeating notification scheduled:', notificationId);
      return notificationId;
    } catch (error) {
      console.error('Error scheduling repeating notification:', error);
      return null;
    }
  },

  /**
   * Cancel a scheduled notification
   * @param {string} notificationId - Notification identifier to cancel
   */
  async cancelNotification(notificationId) {
    try {
      if (notificationId) {
        await Notifications.cancelScheduledNotificationAsync(notificationId);
        console.log('Notification canceled:', notificationId);
      }
    } catch (error) {
      console.error('Error canceling notification:', error);
    }
  },

  /**
   * Cancel all scheduled notifications
   */
  async cancelAllNotifications() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('All notifications canceled');
    } catch (error) {
      console.error('Error canceling all notifications:', error);
    }
  },

  /**
   * Get all scheduled notifications
   * @returns {Promise<Array>} Array of scheduled notifications
   */
  async getAllScheduledNotifications() {
    try {
      const notifications = await Notifications.getAllScheduledNotificationsAsync();
      return notifications;
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      return [];
    }
  },
};
