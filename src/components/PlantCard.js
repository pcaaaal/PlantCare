import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';

export default function PlantCard({ 
  plant, 
  onPress, 
  width, 
  height = 280,
  hasOverdueTask = false,
  hasTodayTask = false 
}) {
  const cardStyle = [
    styles.card,
    { width, height },
    hasOverdueTask && styles.cardOverdue,
    hasTodayTask && !hasOverdueTask && styles.cardToday,
  ];

  return (
    <TouchableOpacity style={cardStyle} onPress={onPress}>
      {plant.imageUri ? (
        <Image
          source={{ uri: plant.imageUri }}
          style={styles.plantImage}
        />
      ) : (
        <View style={styles.plantImagePlaceholder}>
          <Text style={styles.plantImagePlaceholderText}>
            🌿
          </Text>
        </View>
      )}
      <View style={styles.plantCardOverlay}>
        <Text style={styles.plantName}>{plant.name}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    overflow: 'hidden',
    marginRight: 15,
    backgroundColor: '#F5F5F5',
  },
  cardToday: {
    borderWidth: 4,
    borderColor: '#FFC107',
    shadowColor: '#FFC107',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  cardOverdue: {
    borderWidth: 4,
    borderColor: '#F44336',
    shadowColor: '#F44336',
    shadowOffset: { width: 0, height: 0 },
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
  plantName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});
