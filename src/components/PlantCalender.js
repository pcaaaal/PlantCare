import React, {useMemo} from 'react';
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	ScrollView,
} from 'react-native';
import {Ionicons} from '@expo/vector-icons';

/**
 * Calendar component for plant detail view
 * Shows days with dots when tasks are due
 */
export default function PlantCalendar({
	tasks,
	selectedDate,
	onDateSelect,
	onMonthChange,
	onTaskPress,
}) {
	// Get the current month and year
	const currentDate = selectedDate || new Date();
	const year = currentDate.getFullYear();
	const month = currentDate.getMonth();

	const handlePrevMonth = () => {
		const newDate = new Date(year, month - 1, 1);
		if (onMonthChange) {
			onMonthChange(newDate);
		}
	};

	const handleNextMonth = () => {
		const newDate = new Date(year, month + 1, 1);
		if (onMonthChange) {
			onMonthChange(newDate);
		}
	};

	// Get days in month and first day of week
	const daysInMonth = new Date(year, month + 1, 0).getDate();
	const firstDayOfMonth = new Date(year, month, 1).getDay();

	// Calculate task dates for the current month
	const taskDates = useMemo(() => {
		const dates = {};

		tasks.forEach((task) => {
			// Skip completed tasks
			if (task.completed) {
				return;
			}

			if (task.dueDate) {
				const dueDate = new Date(task.dueDate);

				// Show task if it's in the current month
				if (
					dueDate.getMonth() === month &&
					dueDate.getFullYear() === year
				) {
					const day = dueDate.getDate();
					if (!dates[day]) {
						dates[day] = [];
					}
					dates[day].push(task);
				}
			}
		});

		return dates;
	}, [tasks, month, year]);

	// Create array of day objects
	const days = [];

	// Add empty cells for days before the first day of month
	for (let i = 0; i < firstDayOfMonth; i++) {
		days.push({empty: true, key: `empty-${i}`});
	}

	// Add actual days
	for (let day = 1; day <= daysInMonth; day++) {
		days.push({
			day,
			hasTasks: !!taskDates[day],
			taskCount: taskDates[day]?.length || 0,
			key: `day-${day}`,
		});
	}

	const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

	const handleDayPress = (day) => {
		if (day && !day.empty && onDateSelect) {
			const newDate = new Date(year, month, day.day);
			onDateSelect(newDate);
		}
	};

	const isToday = (day) => {
		if (!day || day.empty) return false;
		const today = new Date();
		return (
			day.day === today.getDate() &&
			month === today.getMonth() &&
			year === today.getFullYear()
		);
	};

	return (
		<View style={styles.calendarContainer}>
			{/* Month navigation */}
			<View style={styles.monthNavigation}>
				<TouchableOpacity
					onPress={handlePrevMonth}
					style={styles.navButton}
				>
					<Ionicons name="chevron-back" size={24} />
				</TouchableOpacity>
				<Text style={styles.monthTitle}>
					{new Date(year, month).toLocaleDateString('en-US', {
						month: 'long',
						year: 'numeric',
					})}
				</Text>
				<TouchableOpacity
					onPress={handleNextMonth}
					style={styles.navButton}
				>
					<Ionicons name="chevron-forward" size={24} />
				</TouchableOpacity>
			</View>

			{/* Week day headers */}
			<View style={styles.weekDaysRow}>
				{weekDays.map((day) => (
					<View key={day} style={styles.weekDayCell}>
						<Text style={styles.weekDayText}>{day}</Text>
					</View>
				))}
			</View>

			{/* Calendar grid */}
			<View style={styles.daysGrid}>
				{days.map((day) => (
					<TouchableOpacity
						key={day.key}
						style={[
							styles.dayCell,
							day.empty && styles.dayCellEmpty,
							isToday(day) && styles.dayCellToday,
						]}
						onPress={() => handleDayPress(day)}
						disabled={day.empty}
					>
						{!day.empty && (
							<>
								<Text
									style={[
										styles.dayText,
										isToday(day) && styles.dayTextToday,
									]}
								>
									{day.day}
								</Text>
								{day.hasTasks && (
									<View style={styles.dotContainer}>
										<View style={styles.dot} />
									</View>
								)}
							</>
						)}
					</TouchableOpacity>
				))}
			</View>

			{/* Task summary for selected date or today */}
			<View style={styles.taskSummaryContainer}>
				<Text style={styles.taskSummaryTitle}>
					Tasks for this month:
				</Text>
				<ScrollView style={styles.taskSummary} nestedScrollEnabled>
					{Object.keys(taskDates).length > 0 ? (
						Object.keys(taskDates)
							.sort((a, b) => parseInt(a) - parseInt(b))
							.map((day) => {
								const date = new Date(
									year,
									month,
									parseInt(day),
								);
								const dateStr = date.toLocaleDateString(
									'en-US',
									{
										month: 'short',
										day: 'numeric',
									},
								);

								return (
									<View key={day} style={styles.taskCard}>
										<Text style={styles.taskDate}>
											{dateStr}
										</Text>
										{taskDates[day].map((task, index) => (
											<View
												key={task.id}
												style={[
													styles.taskRow,
													index > 0 &&
														styles.taskRowSpacing,
												]}
											>
												<Text style={styles.taskIcon}>
													{getTaskIcon(task.type)}
												</Text>
												<View
													style={styles.taskContent}
												>
													<Text
														style={styles.taskName}
													>
														{task.type}
													</Text>
												</View>
												<TouchableOpacity
													style={
														styles.completeButton
													}
													onPress={() =>
														onTaskPress &&
														onTaskPress(task.id)
													}
												>
													<Text
														style={
															styles.completeButtonText
														}
													>
														✓
													</Text>
												</TouchableOpacity>
											</View>
										))}
									</View>
								);
							})
					) : (
						<Text style={styles.noTasksText}>
							No tasks scheduled this month
						</Text>
					)}
				</ScrollView>
			</View>
		</View>
	);
}

function getTaskIcon(type) {
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
}

const styles = StyleSheet.create({
	calendarContainer: {
		backgroundColor: '#FFFFFF',
	},
	monthNavigation: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 10,
	},
	navButton: {
		padding: 10,
		minWidth: 40,
		alignItems: 'center',
	},
	navButtonText: {
		fontSize: 28,
		fontWeight: 'bold',
		color: '#4CAF50',
	},
	monthTitle: {
		fontSize: 18,
		fontWeight: 'bold',
		color: '#333',
	},
	weekDaysRow: {
		flexDirection: 'row',
		marginBottom: 5,
	},
	weekDayCell: {
		flex: 1,
		alignItems: 'center',
	},
	weekDayText: {
		fontSize: 12,
		fontWeight: '600',
		color: '#666',
	},
	daysGrid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
	},
	dayCell: {
		width: `${100 / 7}%`, // 7 days in a week
		aspectRatio: 1,
		justifyContent: 'center',
		alignItems: 'center',
		position: 'relative',
		marginBottom: 2,
	},
	dayCellEmpty: {
		backgroundColor: 'transparent',
	},
	dayCellToday: {
		backgroundColor: '#E8F5E9',
		borderRadius: 8,
	},
	dayText: {
		fontSize: 16,
		color: '#333',
	},
	dayTextToday: {
		fontWeight: 'bold',
		color: '#2E7D32',
	},
	dotContainer: {
		position: 'absolute',
		bottom: 4,
		flexDirection: 'row',
		gap: 2,
	},
	dot: {
		width: 5,
		height: 5,
		borderRadius: 2.5,
		backgroundColor: '#4CAF50',
	},
	taskSummaryContainer: {
		marginTop: 3,
		maxHeight: 310,
	},
	taskSummary: {
		maxHeight: 280,
	},
	taskSummaryTitle: {
		fontSize: 16,
		fontWeight: 'bold',
		color: '#333',
		marginBottom: 10,
	},
	taskCard: {
		backgroundColor: '#F5F5F5',
		padding: 16,
		borderRadius: 12,
		marginBottom: 10,
	},
	taskDate: {
		fontSize: 14,
		fontWeight: '600',
		color: '#666',
		marginBottom: 8,
	},
	taskRow: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	taskRowSpacing: {
		marginTop: 8,
	},
	taskIcon: {
		fontSize: 24,
		marginRight: 12,
	},
	taskContent: {
		flex: 1,
	},
	taskName: {
		fontSize: 16,
		fontWeight: '600',
		color: '#333',
	},
	completeButton: {
		width: 36,
		height: 36,
		borderRadius: 18,
		backgroundColor: '#4CAF50',
		justifyContent: 'center',
		alignItems: 'center',
		marginLeft: 8,
	},
	completeButtonText: {
		fontSize: 20,
		color: '#FFFFFF',
		fontWeight: 'bold',
	},
	noTasksText: {
		fontSize: 14,
		color: '#999',
		textAlign: 'center',
		marginTop: 10,
	},
});
