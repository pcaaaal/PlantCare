import React from 'react';
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	TouchableOpacity,
	Image,
	Dimensions,
} from 'react-native';
import {usePlants} from '../context/PlantContext';
import {NotificationDebugger} from '../components/NotificationDebugger';
import PlantCard from '../components/PlantCard';
import TasksToday from '../components/TasksToday';

const {width} = Dimensions.get('window');
const CARD_WIDTH = width * 0.6;

export default function HomeScreen({navigation}) {
	const {plants, tasks, getTodaysTasks, completeTask, loading} = usePlants();

	const todaysTasks = getTodaysTasks();

	const getTaskIcon = (type) => {
		switch (type) {
			case 'Water':
				return '💧';
			case 'Light':
				return '☀️';
			case 'Prune':
				return '✂️';
			default:
				return '📋';
		}
	};

	const getDaysUntilDue = (dueDate) => {
		const now = new Date();
		const due = new Date(dueDate);
		const diffTime = due - now;
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
		return diffDays;
	};

	const hasWateringTaskToday = (plantId) => {
		return todaysTasks.some(
			(task) =>
				task.plantId === plantId &&
				task.type === 'Water' &&
				!task.completed,
		);
	};

	const hasOverdueWateringTask = (plantId) => {
		const now = new Date();
		now.setHours(0, 0, 0, 0);

		return tasks.some((task) => {
			if (
				task.plantId !== plantId ||
				task.type !== 'Water' ||
				task.completed
			) {
				return false;
			}
			const dueDate = new Date(task.dueDate);
			return dueDate < now;
		});
	};

	const getPlantCardStyle = (plantId) => {
		const baseStyle = [styles.plantCard];

		if (hasOverdueWateringTask(plantId)) {
			baseStyle.push(styles.plantCardOverdue);
		} else if (hasWateringTaskToday(plantId)) {
			baseStyle.push(styles.plantCardWateringToday);
		}

		return baseStyle;
	};

	const getPlantPriority = (plantId) => {
		if (hasOverdueWateringTask(plantId)) {
			return 0; // Höchste Priorität - Rot
		} else if (hasWateringTaskToday(plantId)) {
			return 1; // Mittlere Priorität - Gelb
		}
		return 2; // Niedrigste Priorität - Normal
	};

	const sortedPlants = [...plants].sort((a, b) => {
		return getPlantPriority(a.id) - getPlantPriority(b.id);
	});

	if (loading) {
		return (
			<View style={styles.container}>
				<Text style={styles.loadingText}>Loading...</Text>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<View>
					<Text style={styles.title}>PlantCare</Text>
					<Text style={styles.subtitle}>My Garden</Text>
					<Text style={styles.plantCount}>
						You have {plants.length} Plants
					</Text>
				</View>
			</View>

			<ScrollView
				style={styles.mainScroll}
				showsVerticalScrollIndicator={false}
			>
				{/* Plant Carousel */}
				{plants.length > 0 ? (
					<ScrollView
						horizontal
						showsHorizontalScrollIndicator={false}
						style={styles.carousel}
						contentContainerStyle={styles.carouselContent}
					>
						{sortedPlants.map((plant) => (
							<PlantCard
								key={plant.id}
								plant={plant}
								width={CARD_WIDTH}
								height={280}
								hasOverdueTask={hasOverdueWateringTask(plant.id)}
								hasTodayTask={hasWateringTaskToday(plant.id)}
								onPress={() =>
									navigation.navigate('PlantDetail', {
										plantId: plant.id,
									})
								}
							/>
						))}
					</ScrollView>
				) : (
					<View style={styles.emptyPlants}>
						<Text style={styles.emptyText}>
							No plants yet. Add your first plant!
						</Text>
					</View>
				)}

				{/* <NotificationDebugger /> */}

				{/* Tasks Section */}
				<TasksToday
					todaysTasks={todaysTasks}
					plants={plants}
					navigation={navigation}
					completeTask={completeTask}
					getTaskIcon={getTaskIcon}
					getDaysUntilDue={getDaysUntilDue}
					styles={styles}
				/>
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#FFFFFF',
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'flex-start',
		paddingHorizontal: 20,
		paddingTop: 60,
		paddingBottom: 20,
		backgroundColor: '#FFFFFF',
	},
	mainScroll: {
		flex: 1,
	},
	title: {
		fontSize: 36,
		fontWeight: 'bold',
		color: '#4CAF50',
	},
	subtitle: {
		fontSize: 20,
		fontWeight: '600',
		color: '#333',
		marginTop: 4,
	},
	plantCount: {
		fontSize: 14,
		color: '#999',
		marginTop: 4,
	},
	carousel: {
		marginVertical: 20,
		flexGrow: 0,
	},
	carouselContent: {
		paddingHorizontal: 20,
		gap: 15,
	},
	plantCard: {
		width: CARD_WIDTH,
		height: 280,
		borderRadius: 20,
		overflow: 'hidden',
		marginRight: 15,
		backgroundColor: '#F5F5F5',
	},
	plantCardWateringToday: {
		borderWidth: 4,
		borderColor: '#FFC107',
		shadowColor: '#FFC107',
		shadowOffset: {width: 0, height: 0},
		shadowOpacity: 0.3,
		shadowRadius: 8,
		elevation: 8,
	},
	plantCardOverdue: {
		borderWidth: 4,
		borderColor: '#F44336',
		shadowColor: '#F44336',
		shadowOffset: {width: 0, height: 0},
		shadowOpacity: 0.3,
		shadowRadius: 8,
		elevation: 8,
	},
	plantImage: {
		width: '100%',
		height: '100%',
		resizeMode: 'cover',
	},
	plantImagePlaceholder: {
		width: '100%',
		height: '100%',
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#E8F5E9',
	},
	plantImagePlaceholderText: {
		fontSize: 80,
	},
	plantCardOverlay: {
		position: 'absolute',
		bottom: 0,
		left: 0,
		right: 0,
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
		padding: 15,
	},
	plantCardName: {
		fontSize: 22,
		fontWeight: 'bold',
		color: '#FFFFFF',
	},
	emptyPlants: {
		height: 280,
		justifyContent: 'center',
		alignItems: 'center',
		marginVertical: 20,
	},
	emptyText: {
		fontSize: 16,
		color: '#999',
	},
	tasksSection: {
		backgroundColor: '#F9F9F9',
		borderTopLeftRadius: 30,
		borderTopRightRadius: 30,
		paddingTop: 25,
		paddingHorizontal: 20,
		paddingBottom: 100,
		minHeight: 400,
	},
	tasksHeader: {
		fontSize: 22,
		fontWeight: 'bold',
		color: '#333',
		marginBottom: 15,
	},
	tasksList: {
		paddingBottom: 20,
	},
	taskItem: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#FFFFFF',
		padding: 16,
		borderRadius: 12,
		marginBottom: 10,
		shadowColor: '#000',
		shadowOffset: {width: 0, height: 1},
		shadowOpacity: 0.05,
		shadowRadius: 2,
		elevation: 1,
	},
	taskIcon: {
		fontSize: 24,
		marginRight: 12,
	},
	taskContent: {
		flex: 1,
	},
	taskTitle: {
		fontSize: 16,
		fontWeight: '600',
		color: '#333',
	},
	taskPlant: {
		fontSize: 14,
		color: '#999',
		marginTop: 2,
	},
	taskDays: {
		fontSize: 14,
		fontWeight: '600',
		color: '#4CAF50',
	},
	taskDaysToday: {
		color: '#FF9800',
	},
	taskDaysOverdue: {
		color: '#F44336',
	},
	completeButton: {
		width: 36,
		height: 36,
		borderRadius: 18,
		borderColor: '#4CAF50',
		borderWidth: 2,
		justifyContent: 'center',
		alignItems: 'center',
		marginLeft: 8,
	},
	completeButtonText: {
		fontSize: 20,
		color: '#4CAF50',
		fontWeight: 'bold',
	},
	noTasks: {
		textAlign: 'center',
		color: '#999',
		fontSize: 16,
		marginTop: 20,
	},
	loadingText: {
		flex: 1,
		textAlign: 'center',
		marginTop: 100,
		fontSize: 18,
		color: '#999',
	},
});
