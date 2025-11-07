import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function PlantCard({ name, wateringSchedule }) {
  return (
    <View style={styles.card}>
      <Text style={styles.plantName}>{name}</Text>
      <Text style={styles.wateringInfo}>Gießen: {wateringSchedule}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 15,
    marginVertical: 8,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  plantName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d5f2e',
    marginBottom: 5,
  },
  wateringInfo: {
    fontSize: 14,
    color: '#5a8f5b',
  },
});
