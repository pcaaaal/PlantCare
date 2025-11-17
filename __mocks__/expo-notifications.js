// __mocks__/expo-notifications.js
export const getPermissionsAsync = jest.fn(() =>
	Promise.resolve({status: 'granted'}),
);
export const requestPermissionsAsync = jest.fn();
export const scheduleNotificationAsync = jest.fn(() =>
	Promise.resolve('notif-123'),
);
export const cancelScheduledNotificationAsync = jest.fn();
export const cancelAllScheduledNotificationsAsync = jest.fn();
export const getAllScheduledNotificationsAsync = jest.fn(() =>
	Promise.resolve([]),
);
export const setNotificationHandler = jest.fn();
export const setNotificationChannelAsync = jest.fn();

export const AndroidImportance = {MAX: 5};
export const AndroidNotificationPriority = {HIGH: 1};
export const SchedulableTriggerInputTypes = {DATE: 'date'};
