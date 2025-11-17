// __mocks__/storageService.js
const storageService = {
	getPlants: jest.fn(() => Promise.resolve([])),
	getTasks: jest.fn(() => Promise.resolve([])),
	addPlant: jest.fn((p) => Promise.resolve({...p, id: 1})),
	addTask: jest.fn((t) =>
		Promise.resolve({...t, id: Math.floor(Math.random() * 1000)}),
	),
	updateTask: jest.fn(() => Promise.resolve()),
	updatePlant: jest.fn(() => Promise.resolve()),
	deletePlant: jest.fn(() => Promise.resolve()),
	deleteTask: jest.fn(() => Promise.resolve()),
};

export default storageService;
