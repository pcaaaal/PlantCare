import React from 'react';
import {View, Text, TouchableOpacity} from 'react-native';

export default function TasksToday({
	todaysTasks,
	plants,
	navigation,
	completeTask,
	getTaskIcon,
	getDaysUntilDue,
	styles,
}) {
	return (
		<View style={styles.tasksSection}>
			<Text style={styles.tasksHeader}>Tasks Today</Text>
			<View style={styles.tasksList}>
				{todaysTasks.length > 0 ? (
					todaysTasks.map((task) => {
						const daysUntil = getDaysUntilDue(task.dueDate);
						const plant = plants.find((p) => p.id === task.plantId);
						return (
							<View key={task.id} style={styles.taskItem}>
								<Text style={styles.taskIcon}>
									{getTaskIcon(task.type)}
								</Text>
								<TouchableOpacity
									style={styles.taskContent}
									onPress={() =>
										navigation.navigate('PlantDetail', {
											plantId: task.plantId,
										})
									}
								>
									<Text style={styles.taskTitle}>
										{task.title}
									</Text>
									{plant && (
										<Text style={styles.taskPlant}>
											{plant.name}
										</Text>
									)}
								</TouchableOpacity>
								<Text
									style={[
										styles.taskDays,
										daysUntil === 0 && styles.taskDaysToday,
										daysUntil < 0 && styles.taskDaysOverdue,
									]}
								>
									{daysUntil === 0
										? 'Today'
										: daysUntil < 0
										? 'Overdue'
										: `${daysUntil}d`}
								</Text>
								<TouchableOpacity
									style={styles.completeButton}
									onPress={async () => {
										await completeTask(task.id);
									}}
								>
									<Text style={styles.completeButtonText}>
										✓
									</Text>
								</TouchableOpacity>
							</View>
						);
					})
				) : (
					<Text style={styles.noTasks}>No upcoming tasks</Text>
				)}
			</View>
		</View>
	);
}
