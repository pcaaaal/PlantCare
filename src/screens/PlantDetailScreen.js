import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { usePlants } from '../context/PlantContext';

export default function PlantDetailScreen({ route, navigation }) {
  const { plantId } = route.params;
  const { plants, getTasksForPlant, completeTask, deletePlant } = usePlants();
  const [plant, setPlant] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    const foundPlant = plants.find(p => p.id === plantId);
    setPlant(foundPlant);
    if (foundPlant) {
      const plantTasks = getTasksForPlant(plantId);
      setTasks(plantTasks);
    }
  }, [plantId, plants]);

  const handleCompleteTask = async (taskId) => {
    try {
      await completeTask(taskId);
      Alert.alert('Success', 'Task completed!');
      // Refresh tasks
      const plantTasks = getTasksForPlant(plantId);
      setTasks(plantTasks);
    } catch (error) {
      Alert.alert('Error', 'Failed to complete task');
    }
  };

  const handleDeletePlant = () => {
    Alert.alert(
      'Delete Plant',
      `Are you sure you want to delete ${plant.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePlant(plantId);
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete plant');
            }
          },
        },
      ]
    );
  };

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

  const formatDate = (date) => {
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${day}.${month}.${year}`;
  };

  if (!plant) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Plant not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Header with Plant Image */}
        <View style={styles.imageContainer}>
          {plant.imageUri ? (
            <Image source={{ uri: plant.imageUri }} style={styles.plantImage} />
          ) : (
            <View style={styles.plantImagePlaceholder}>
              <Text style={styles.plantImagePlaceholderText}>🌿</Text>
            </View>
          )}
          
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuButton}
            onPress={handleDeletePlant}
          >
            <Text style={styles.menuButtonText}>⋮</Text>
          </TouchableOpacity>
        </View>

        {/* Calendar Section */}
        <View style={styles.calendarSection}>
          <Text style={styles.calendarMonth}>
            {selectedDate.toLocaleDateString('en-US', { month: 'long' })}
          </Text>
          <View style={styles.calendar}>
            <Text style={styles.calendarNote}>Calendar view - simplified</Text>
          </View>
        </View>

        {/* Current Date Display */}
        <View style={styles.dateDisplay}>
          <Text style={styles.dateText}>{formatDate(new Date())}</Text>
        </View>

        {/* Tasks Section */}
        <View style={styles.tasksSection}>
          <Text style={styles.sectionTitle}>Tasks</Text>
          {tasks.length > 0 ? (
            tasks.map((task) => {
              const daysUntil = getDaysUntilDue(task.nextDueDate);
              return (
                <TouchableOpacity
                  key={task.id}
                  style={styles.taskItem}
                  onPress={() => handleCompleteTask(task.id)}
                >
                  <Text style={styles.taskIcon}>{getTaskIcon(task.type)}</Text>
                  <View style={styles.taskContent}>
                    <Text style={styles.taskTitle}>{task.type}</Text>
                    <Text style={styles.taskSubtitle}>
                      {daysUntil === 0 ? 'Today' : daysUntil < 0 ? 'Overdue' : `In ${daysUntil} days`}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })
          ) : (
            <Text style={styles.noTasks}>No tasks for this plant</Text>
          )}
        </View>

        {/* Plant Info Section */}
        <View style={styles.infoSection}>
          <Text style={styles.plantName}>{plant.name}</Text>
          {plant.description && (
            <Text style={styles.plantDescription}>{plant.description}</Text>
          )}
          
          {plant.scientificName && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Scientific Name:</Text>
              <Text style={styles.infoValue}>
                {Array.isArray(plant.scientificName) ? plant.scientificName.join(', ') : plant.scientificName}
              </Text>
            </View>
          )}
          
          {plant.watering && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Watering:</Text>
              <Text style={styles.infoValue}>{plant.watering}</Text>
            </View>
          )}
          
          {plant.wateringGeneralBenchmark && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Water Frequency:</Text>
              <Text style={styles.infoValue}>
                Every {plant.wateringGeneralBenchmark.value} {plant.wateringGeneralBenchmark.unit}
              </Text>
            </View>
          )}
          
          {plant.sunlight && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Sunlight:</Text>
              <Text style={styles.infoValue}>
                {Array.isArray(plant.sunlight) ? plant.sunlight.join(', ') : plant.sunlight}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  imageContainer: {
    width: '100%',
    height: 400,
    position: 'relative',
  },
  plantImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  plantImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  plantImagePlaceholderText: {
    fontSize: 100,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 24,
    color: '#333',
  },
  menuButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuButtonText: {
    fontSize: 24,
    color: '#333',
  },
  calendarSection: {
    padding: 20,
  },
  calendarMonth: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 15,
  },
  calendar: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  calendarNote: {
    fontSize: 14,
    color: '#999',
  },
  dateDisplay: {
    backgroundColor: '#F9F9F9',
    paddingVertical: 15,
    alignItems: 'center',
  },
  dateText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  tasksSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
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
  taskSubtitle: {
    fontSize: 14,
    color: '#999',
    marginTop: 2,
  },
  noTasks: {
    textAlign: 'center',
    color: '#999',
    fontSize: 16,
    marginTop: 10,
  },
  infoSection: {
    padding: 20,
    backgroundColor: '#F9F9F9',
  },
  plantName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  plantDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 20,
  },
  infoRow: {
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
  },
  errorText: {
    flex: 1,
    textAlign: 'center',
    marginTop: 100,
    fontSize: 18,
    color: '#999',
  },
});
