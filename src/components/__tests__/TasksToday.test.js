import React from 'react';
import renderer from 'react-test-renderer';
import TasksToday from '../TasksToday';

describe('TasksToday', () => {
	let component;

	const mockPlants = [
		{id: '1', name: 'Ficus'},
		{id: '2', name: 'Aloe'},
	];

	const mockNavigation = {navigate: jest.fn()};
	const mockCompleteTask = jest.fn();

	const simpleStyles = {
		tasksSection: {padding: 1},
		tasksHeader: {fontSize: 1},
		tasksList: {paddingBottom: 1},
		taskItem: {flexDirection: 'row'},
		taskIcon: {fontSize: 1},
		taskContent: {flex: 1},
		taskTitle: {fontSize: 1},
		taskPlant: {fontSize: 1},
		taskDays: {fontSize: 1},
		taskDaysToday: {color: 'orange'},
		taskDaysOverdue: {color: 'red'},
		completeButton: {width: 10, height: 10},
		completeButtonText: {fontSize: 1},
		noTasks: {fontSize: 1},
	};

	afterEach(() => {
		if (component) {
			renderer.act(() => {
				component.unmount();
			});
			component = null;
		}
		mockNavigation.navigate.mockClear();
		mockCompleteTask.mockClear();
	});

	it('renders correctly with tasks (snapshot)', () => {
		const now = new Date();
		const todaysTasks = [
			{
				id: 't1',
				title: 'Water Ficus',
				plantId: '1',
				type: 'Water',
				dueDate: now.toISOString(),
				completed: false,
			},
		];

		const getTaskIcon = (type) => (type === 'Water' ? '💧' : '📋');
		const getDaysUntilDue = (dueDate) => {
			const now = new Date();
			const due = new Date(dueDate);
			const diffTime = due - now;
			const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
			return diffDays;
		};

		renderer.act(() => {
			component = renderer.create(
				<TasksToday
					todaysTasks={todaysTasks}
					plants={mockPlants}
					navigation={mockNavigation}
					completeTask={mockCompleteTask}
					getTaskIcon={getTaskIcon}
					getDaysUntilDue={getDaysUntilDue}
					styles={simpleStyles}
				/>,
			);
		});

		const tree = component.toJSON();
		expect(tree).toMatchSnapshot();
	});

	it('renders correctly with no tasks (snapshot)', () => {
		const getTaskIcon = () => '📋';
		const getDaysUntilDue = () => 1;

		renderer.act(() => {
			component = renderer.create(
				<TasksToday
					todaysTasks={[]}
					plants={mockPlants}
					navigation={mockNavigation}
					completeTask={mockCompleteTask}
					getTaskIcon={getTaskIcon}
					getDaysUntilDue={getDaysUntilDue}
					styles={simpleStyles}
				/>,
			);
		});

		const tree = component.toJSON();
		expect(tree).toMatchSnapshot();
	});
});
