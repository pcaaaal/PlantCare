import * as Notifications from 'expo-notifications';
import {Platform} from 'react-native';

// Global notification handler for iOS foreground notifications
Notifications.setNotificationHandler({
	handleNotification: async () => ({
		shouldShowBanner: true,
		shouldPlaySound: true,
		shouldSetBadge: true,
	}),
});

let channelConfigured = false;

/**
 * Normalize input to a valid Date object
 */
function normalizeDate(input) {
	if (input instanceof Date) return new Date(input.getTime());
	const parsed = new Date(input);
	if (isNaN(parsed.getTime())) return null;
	return new Date(parsed.getTime());
}

export const notificationService = {
	/**
	 * Request permissions and set Android channel
	 */
	async requestPermissions() {
		try {
			const existing = await Notifications.getPermissionsAsync();
			let finalStatus = existing.status;

			if (finalStatus !== 'granted') {
				const req = await Notifications.requestPermissionsAsync();
				finalStatus = req.status;
			}

			if (finalStatus !== 'granted') return false;

			if (Platform.OS === 'android' && !channelConfigured) {
				await Notifications.setNotificationChannelAsync('default', {
					name: 'Plant Care Reminders',
					importance: Notifications.AndroidImportance.MAX,
					vibrationPattern: [0, 250, 250, 250],
					lightColor: '#4CAF50',
				});
				channelConfigured = true;
			}

			return true;
		} catch {
			return false;
		}
	},

	/**
	 * Build a safe trigger object for Expo notifications
	 */
	buildTrigger(targetDate) {
		const now = new Date();
		const diffMs = targetDate.getTime() - now.getTime();

		if (diffMs < 0) return null;

		const diffSeconds = Math.round(diffMs / 1000);
		if (diffSeconds < 60) {
			return {seconds: Math.max(1, diffSeconds), repeats: false};
		}

		return {
			type: Notifications.SchedulableTriggerInputTypes.DATE,
			date: targetDate,
		};
	},

	/**
	 * Schedule a single notification
	 */
	async scheduleNotification({plantName, triggerDate, taskId}) {
		const hasPermission = await this.requestPermissions();
		if (!hasPermission) return null;

		const date = normalizeDate(triggerDate);
		if (!date || date <= new Date()) return null;

		const trigger = this.buildTrigger(date);
		if (!trigger) return null;

		const id = await Notifications.scheduleNotificationAsync({
			content: {
				title: '💧 Time to Water!',
				body: `Your ${plantName} needs watering today.`,
				data: {taskId, plantName},
				sound: true,
				priority: Notifications.AndroidNotificationPriority.HIGH,
			},
			trigger,
		});

		return id;
	},

	/**
	 * Schedule multiple notifications
	 */
	async scheduleMultipleNotifications(paramsArray) {
		const ids = [];
		for (const params of paramsArray) {
			const id = await this.scheduleNotification(params);
			if (id) ids.push(id);
		}
		return ids;
	},

	/**
	 * Cancel a notification
	 */
	async cancelNotification(id) {
		if (!id) return;
		await Notifications.cancelScheduledNotificationAsync(id);
	},

	/**
	 * Cancel multiple notifications
	 */
	async cancelMultipleNotifications(ids) {
		for (const id of ids) await this.cancelNotification(id);
	},

	/**
	 * Cancel all notifications
	 */
	async cancelAllNotifications() {
		await Notifications.cancelAllScheduledNotificationsAsync();
	},

	/**
	 * Get all scheduled notifications
	 */
	async getAllScheduledNotifications() {
		return await Notifications.getAllScheduledNotificationsAsync();
	},

	/**
	 * Cancel notifications for a specific plant
	 */
	async cancelNotificationsForPlant(plantId) {
		const all = await this.getAllScheduledNotifications();
		const matches = all.filter((n) => n.content?.data?.plantId === plantId);
		for (const n of matches) {
			await Notifications.cancelScheduledNotificationAsync(n.identifier);
		}
	},
};
