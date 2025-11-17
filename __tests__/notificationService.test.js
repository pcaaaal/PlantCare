// __tests__/notificationService.test.js
import {notificationService} from '../src/services/notificationService';
import * as Notifications from 'expo-notifications';

jest.mock('expo-notifications');

jest.mock('react-native', () => {
	return {Platform: {OS: 'ios'}};
});

describe('notificationService', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	test('rejects invalid trigger date', async () => {
		const id = await notificationService.scheduleNotification({
			plantName: 'Aloe',
			triggerDate: 'invalid-date',
			taskId: 10,
		});
		expect(id).toBe(null);
	});

	test('schedules a DATE trigger correctly', async () => {
		const future = new Date(Date.now() + 5 * 60 * 1000);

		const id = await notificationService.scheduleNotification({
			plantName: 'Monstera',
			triggerDate: future,
			taskId: 55,
		});

		expect(id).toBe('notif-123');
		expect(Notifications.scheduleNotificationAsync).toHaveBeenCalled();
	});

	test('cancels a notification', async () => {
		await notificationService.cancelNotification('notif-1');
		expect(
			Notifications.cancelScheduledNotificationAsync,
		).toHaveBeenCalledWith('notif-1');
	});

	test('cancels all notifications', async () => {
		await notificationService.cancelAllNotifications();
		expect(
			Notifications.cancelAllScheduledNotificationsAsync,
		).toHaveBeenCalled();
	});
});
