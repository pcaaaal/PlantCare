import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { usePlants } from '../context/PlantContext';
import { storageService } from '../services/storageService';
import { initializeSampleData, resetWithSampleData } from '../utils/sampleData';

export default function ProfileScreen() {
  const { plants, tasks, refreshData } = usePlants();

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'Are you sure you want to delete all plants and tasks? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await storageService.clearAll();
              await refreshData();
              Alert.alert('Success', 'All data has been cleared');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear data');
            }
          },
        },
      ]
    );
  };

  const handleLoadSampleData = async () => {
    try {
      if (plants.length > 0) {
        Alert.alert(
          'Load Sample Data',
          'You already have plants. Do you want to replace all data with sample data?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Replace',
              style: 'destructive',
              onPress: async () => {
                await resetWithSampleData();
                await refreshData();
                Alert.alert('Success', 'Sample data loaded successfully');
              },
            },
          ]
        );
      } else {
        await initializeSampleData();
        await refreshData();
        Alert.alert('Success', 'Sample data loaded successfully');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load sample data');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>Your Garden Stats</Text>
          
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Total Plants:</Text>
            <Text style={styles.statValue}>{plants.length}</Text>
          </View>
          
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Active Tasks:</Text>
            <Text style={styles.statValue}>{tasks.length}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About PlantCare</Text>
          <Text style={styles.sectionText}>
            PlantCare helps you keep your plants healthy and happy by reminding you when to water them and tracking their care.
          </Text>
          <Text style={styles.version}>Version 1.0.0</Text>
        </View>

        <View style={styles.buttonGroup}>
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={handleLoadSampleData}
          >
            <Text style={styles.primaryButtonText}>Load Sample Data</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.dangerButton}
            onPress={handleClearData}
          >
            <Text style={styles.dangerButtonText}>Clear All Data</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  statsCard: {
    backgroundColor: '#F0F7F0',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  statLabel: {
    fontSize: 16,
    color: '#666',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  sectionText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 10,
  },
  version: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
  },
  buttonGroup: {
    gap: 15,
  },
  primaryButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dangerButton: {
    backgroundColor: '#F44336',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  dangerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
