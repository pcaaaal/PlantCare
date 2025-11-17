// __tests__/plantContext.deletePlant.test.js
import React from 'react';
import {renderHook, act} from '@testing-library/react-hooks';

jest.mock('expo-notifications');

// Shared mock storage (same pattern as addPlant.test)
const mockStorage = {
	plants: [],
	tasks: [],
};

jest.mock('../../services/storageService', () => ({
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

		updateTask: jest.fn(() => Promise.resolve()),
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

describe('PlantContext — deletePlant', () => {
	beforeEach(() => {
		mockStorage.plants = [];
		mockStorage.tasks = [];
	});

	test('deleting plant cancels notifications + removes tasks', async () => {
		const wrapper = ({children}) => (
			<PlantProvider>{children}</PlantProvider>
		);

		const {result, waitForValueToChange} = renderHook(() => usePlants(), {
			wrapper,
		});

		// Wait for initial data to load (same pattern as addPlant test)
		await act(async () => {
			await new Promise((resolve) => setTimeout(resolve, 50));
		});

		// Add plant first
		let added;
		await act(async () => {
			added = await result.current.addPlant({
				name: 'Cactus',
				wateringGeneralBenchmark: {value: '14'},
			});
		});

		// Wait for state updates
		await act(async () => {
			await new Promise((resolve) => setTimeout(resolve, 100));
		});

		expect(result.current.plants.length).toBe(1);
		expect(result.current.tasks.length).toBeGreaterThan(3); // tasks should exist

		// Delete the plant
		await act(async () => {
			await result.current.deletePlant(added.id);
		});

		// Wait for update
		await act(async () => {
			await new Promise((resolve) => setTimeout(resolve, 100));
		});

		// Expectations (mirroring addPlant test style)
		expect(result.current.plants.length).toBe(0);
		expect(result.current.tasks.length).toBe(0);
	});
});
