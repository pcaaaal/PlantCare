// __mocks__/notificationService.js
// Remove the jest.mock() call - just export the mock directly
export const notificationService = {
	requestPermissions: jest.fn(() => Promise.resolve(true)),
	scheduleNotification: jest.fn(() => Promise.resolve('notif-xyz')),
	cancelNotification: jest.fn(() => Promise.resolve()),
	cancelAllNotifications: jest.fn(() => Promise.resolve()),
};

// If your actual service has a default export, also provide that
export default notificationService;
