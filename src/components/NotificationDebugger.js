import React, {useState} from 'react';
import {
	View,
	Text,
	ScrollView,
	TouchableOpacity,
	StyleSheet,
	Alert,
} from 'react-native';
import {notificationService} from '../services/notificationService';
import {usePlants} from '../context/PlantContext';

export const NotificationDebugger = () => {
	const [scheduledNotifications, setScheduledNotifications] = useState([]);
	const [permissions, setPermissions] = useState(null);
	const [loading, setLoading] = useState(false);
	const {tasks, plants} = usePlants();

	const checkPermissions = async () => {
		setLoading(true);
		try {
			const hasPermission =
				await notificationService.requestPermissions();
			setPermissions(hasPermission);
			Alert.alert(
				'Permissions',
				hasPermission ? '✅ Granted' : '❌ Denied',
				[{text: 'OK'}],
			);
		} catch (error) {
			Alert.alert('Error', error.message);
		} finally {
			setLoading(false);
		}
	};

	const loadScheduledNotifications = async () => {
		setLoading(true);
		try {
			const notifications =
				await notificationService.getAllScheduledNotifications();
			setScheduledNotifications(notifications);
			console.log('=== SCHEDULED NOTIFICATIONS ===');
			console.log(`Total: ${notifications.length}`);
			notifications.forEach((n, i) => {
				console.log(`${i + 1}. ${n.content.title}`);
				console.log(`   Body: ${n.content.body}`);
				console.log(
					`   Trigger: ${new Date(n.trigger.value).toLocaleString()}`,
				);
				console.log(`   ID: ${n.identifier}`);
				console.log(`   Data:`, n.content.data);
				console.log('---');
			});
			console.log('==============================');
		} catch (error) {
			console.error('Error loading notifications:', error);
			Alert.alert('Error', error.message);
		} finally {
			setLoading(false);
		}
	};

	const scheduleTestNotification = async () => {
		setLoading(true);
		try {
			const testDate = new Date();
			testDate.setMinutes(testDate.getMinutes() + 1);
			const id = await notificationService.scheduleNotification({
				plantName: 'Test Plant',
				triggerDate: testDate,
				taskId: 999999,
			});
			if (id) {
				Alert.alert(
					'Test Notification Scheduled',
					`Will trigger at ${testDate.toLocaleTimeString()}`,
					[{text: 'OK', onPress: loadScheduledNotifications}],
				);
			} else {
				Alert.alert('Failed', 'Could not schedule notification');
			}
		} catch (error) {
			console.error('Error scheduling test:', error);
			Alert.alert('Error', error.message);
		} finally {
			setLoading(false);
		}
	};

	const cancelAllNotifications = async () => {
		Alert.alert(
			'Cancel All?',
			'This will cancel all scheduled notifications',
			[
				{text: 'Cancel', style: 'cancel'},
				{
					text: 'Yes, Cancel All',
					style: 'destructive',
					onPress: async () => {
						setLoading(true);
						try {
							await notificationService.cancelAllNotifications();
							await loadScheduledNotifications();
							Alert.alert('Done', 'All notifications canceled');
						} catch (error) {
							Alert.alert('Error', error.message);
						} finally {
							setLoading(false);
						}
					},
				},
			],
		);
	};

	const showTaskInfo = () => {
		console.log('=== TASKS INFO ===');
		console.log(`Total tasks: ${tasks.length}`);
		console.log(`Completed: ${tasks.filter((t) => t.completed).length}`);
		console.log(`Pending: ${tasks.filter((t) => !t.completed).length}`);
		const tasksByPlant = {};
		tasks.forEach((t) => {
			if (!tasksByPlant[t.plantId]) {
				tasksByPlant[t.plantId] = {completed: 0, pending: 0};
			}
			if (t.completed) {
				tasksByPlant[t.plantId].completed++;
			} else {
				tasksByPlant[t.plantId].pending++;
			}
		});
		plants.forEach((p) => {
			const stats = tasksByPlant[p.id] || {completed: 0, pending: 0};
			console.log(`\n${p.name}:`);
			console.log(`  Pending: ${stats.pending}`);
			console.log(`  Completed: ${stats.completed}`);
		});
		console.log('\nPending tasks:');
		tasks
			.filter((t) => !t.completed)
			.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
			.forEach((t) => {
				const plant = plants.find((p) => p.id === t.plantId);
				console.log(
					`  - ${plant?.name}: ${new Date(
						t.dueDate,
					).toLocaleDateString()}`,
				);
			});
		console.log('==================');
		Alert.alert('Task Info', 'Check console for details');
	};

	return (
		<ScrollView style={styles.container}>
			<Text style={styles.title}>🐛 Notification Debugger</Text>
			<View style={styles.section}>
				<Text style={styles.sectionTitle}>Status</Text>
				<Text style={styles.info}>Plants: {plants.length}</Text>
				<Text style={styles.info}>Tasks: {tasks.length}</Text>
				<Text style={styles.info}>
					Permissions:{' '}
					{permissions === null ? '?' : permissions ? '✅' : '❌'}
				</Text>
				<Text style={styles.info}>
					Scheduled: {scheduledNotifications.length} notifications
				</Text>
			</View>
			<View style={styles.section}>
				<Text style={styles.sectionTitle}>Actions</Text>
				<TouchableOpacity
					style={styles.button}
					onPress={checkPermissions}
					disabled={loading}
				>
					<Text style={styles.buttonText}>Check Permissions</Text>
				</TouchableOpacity>
				<TouchableOpacity
					style={styles.button}
					onPress={loadScheduledNotifications}
					disabled={loading}
				>
					<Text style={styles.buttonText}>
						Load Scheduled Notifications
					</Text>
				</TouchableOpacity>
				<TouchableOpacity
					style={styles.button}
					onPress={scheduleTestNotification}
					disabled={loading}
				>
					<Text style={styles.buttonText}>Schedule Test (1 min)</Text>
				</TouchableOpacity>
				<TouchableOpacity
					style={styles.button}
					onPress={showTaskInfo}
					disabled={loading}
				>
					<Text style={styles.buttonText}>Show Task Info</Text>
				</TouchableOpacity>
				<TouchableOpacity
					style={[styles.button, styles.dangerButton]}
					onPress={cancelAllNotifications}
					disabled={loading}
				>
					<Text style={styles.buttonText}>
						Cancel All Notifications
					</Text>
				</TouchableOpacity>
			</View>
			<View style={styles.section}>
				<Text style={styles.sectionTitle}>
					Scheduled Notifications ({scheduledNotifications.length})
				</Text>
				{scheduledNotifications.length === 0 ? (
					<Text style={styles.emptyText}>
						No scheduled notifications. Tap "Load Scheduled
						Notifications" to check.
					</Text>
				) : (
					scheduledNotifications.map((notification, index) => {
						const trigger = notification.trigger;
						let triggerDate;
						if (
							trigger.type === 'timeInterval' &&
							trigger.seconds
						) {
							triggerDate = new Date(
								Date.now() + trigger.seconds * 1000,
							);
						} else if (
							(trigger.type === 'date' ||
								trigger.type === 'calendar') &&
							trigger.date
						) {
							triggerDate = new Date(trigger.date);
						} else {
							triggerDate = null;
						}
						const plant = plants.find(
							(p) => p.id === notification.content.data?.plantId,
						);
						return (
							<View
								key={notification.identifier}
								style={styles.notificationCard}
							>
								<Text style={styles.notificationTitle}>
									{index + 1}. {notification.content.title}
								</Text>
								<Text style={styles.notificationBody}>
									{notification.content.body}
								</Text>
								<Text style={styles.notificationTime}>
									📅{' '}
									{triggerDate
										? triggerDate.toLocaleDateString()
										: 'Unknown'}{' '}
									at{' '}
									{triggerDate
										? triggerDate.toLocaleTimeString()
										: 'Unknown'}
								</Text>
								<Text style={styles.notificationMeta}>
									ID:{' '}
									{notification.identifier.substring(0, 20)}
									...
								</Text>
								{notification.content.data?.taskId && (
									<Text style={styles.notificationMeta}>
										Task ID:{' '}
										{notification.content.data.taskId}
									</Text>
								)}
							</View>
						);
					})
				)}
			</View>
			<View style={styles.section}>
				<Text style={styles.sectionTitle}>⚠️ Important Notes</Text>
				<Text style={styles.warningText}>
					• Expo Go has limited notification support{'\n'}• Test on a
					development build or production build{'\n'}• Check console
					logs for detailed info{'\n'}• Notifications won't fire if
					app is force-closed on iOS{'\n'}• Make sure "Allow
					Notifications" is ON in device settings
				</Text>
			</View>
		</ScrollView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 16,
		backgroundColor: '#f5f5f5',
	},
	title: {
		fontSize: 24,
		fontWeight: 'bold',
		marginBottom: 20,
		textAlign: 'center',
	},
	section: {
		backgroundColor: 'white',
		borderRadius: 8,
		padding: 16,
		marginBottom: 16,
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: 'bold',
		marginBottom: 12,
	},
	info: {
		fontSize: 14,
		marginBottom: 4,
		color: '#333',
	},
	button: {
		backgroundColor: '#4CAF50',
		padding: 12,
		borderRadius: 8,
		marginBottom: 8,
	},
	dangerButton: {
		backgroundColor: '#f44336',
	},
	buttonText: {
		color: 'white',
		textAlign: 'center',
		fontWeight: '600',
		fontSize: 14,
	},
	notificationCard: {
		backgroundColor: '#f9f9f9',
		padding: 12,
		borderRadius: 6,
		marginBottom: 8,
		borderLeftWidth: 3,
		borderLeftColor: '#4CAF50',
	},
	notificationTitle: {
		fontSize: 16,
		fontWeight: 'bold',
		marginBottom: 4,
	},
	notificationBody: {
		fontSize: 14,
		color: '#666',
		marginBottom: 8,
	},
	notificationTime: {
		fontSize: 12,
		color: '#4CAF50',
		marginBottom: 4,
	},
	notificationMeta: {
		fontSize: 10,
		color: '#999',
	},
	emptyText: {
		color: '#999',
		fontStyle: 'italic',
		textAlign: 'center',
		marginVertical: 12,
	},
	warningText: {
		fontSize: 12,
		color: '#666',
		lineHeight: 20,
	},
});
