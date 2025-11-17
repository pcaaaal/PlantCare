import React from 'react';
import {renderHook, act} from '@testing-library/react-hooks';

jest.mock('expo-notifications');

// Create storage that actually stores data
const mockStorage = {
	plants: [],
	tasks: [],
};

jest.mock('../../services/storageService.js', () => ({
	storageService: {
		getPlants: jest.fn(() => Promise.resolve([...mockStorage.plants])),
		getTasks: jest.fn(() => Promise.resolve([...mockStorage.tasks])),
		addPlant: jest.fn((p) => {
			const newPlant = {...p, id: mockStorage.plants.length + 1};
			mockStorage.plants.push(newPlant);
			return Promise.resolve(newPlant);
		}),
		addTask: jest.fn((t) => {
			const newTask = {...t, id: Math.floor(Math.random() * 1000)};
			mockStorage.tasks.push(newTask);
			return Promise.resolve(newTask);
		}),
		updateTask: jest.fn((id, updates) => {
			const taskIndex = mockStorage.tasks.findIndex((t) => t.id === id);
			if (taskIndex !== -1) {
				mockStorage.tasks[taskIndex] = {
					...mockStorage.tasks[taskIndex],
					...updates,
				};
			}
			return Promise.resolve();
		}),
		updatePlant: jest.fn(() => Promise.resolve()),
		deletePlant: jest.fn((id) => {
			mockStorage.plants = mockStorage.plants.filter((p) => p.id !== id);
			return Promise.resolve();
		}),
		deleteTask: jest.fn((id) => {
			mockStorage.tasks = mockStorage.tasks.filter((t) => t.id !== id);
			return Promise.resolve();
		}),
	},
}));

jest.mock('../../services/notificationService');
jest.mock('../../services/plantApiService', () => ({
	searchPlants: jest.fn(() => Promise.resolve([])),
	getPlantDetails: jest.fn(),
}));

import {PlantProvider, usePlants} from '../../context/PlantContext';

describe('PlantContext — addPlant', () => {
	beforeEach(() => {
		// Reset storage before each test
		mockStorage.plants = [];
		mockStorage.tasks = [];
	});

	test('adding plant creates tasks + schedules notifications', async () => {
		const wrapper = ({children}) => (
			<PlantProvider>{children}</PlantProvider>
		);

		const {result, waitForValueToChange} = renderHook(() => usePlants(), {
			wrapper,
		});

		// Wait for initial load to complete
		await act(async () => {
			await new Promise((resolve) => setTimeout(resolve, 50));
		});

		// Perform the add operation
		let addResult;
		await act(async () => {
			addResult = await result.current.addPlant({
				name: 'Aloe Vera',
				wateringGeneralBenchmark: {value: '7'},
			});
		});

		// Wait for state to update
		await act(async () => {
			await new Promise((resolve) => setTimeout(resolve, 100));
		});

		// Check that the plant was added
		expect(result.current.plants.length).toBe(1);
		expect(result.current.plants[0].name).toBe('Aloe Vera');

		// Check that tasks were created
		expect(result.current.tasks.length).toBeGreaterThan(5);

		// Verify all tasks are for the correct plant
		expect(
			result.current.tasks.every((t) => t.plantId === addResult.id),
		).toBe(true);
	});
});
