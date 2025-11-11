import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert, ScrollView, StyleSheet } from 'react-native';
import * as SecureStore from 'expo-secure-store';

export default function AgeRatingScreen({ darkMode, userEmail, accessToken, onAgeRatingChange, currentProfile }) {
  const [currentAgeRating, setCurrentAgeRating] = useState('children');
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Skip password check since user is already authenticated

  const ageRatings = [
    { value: 'toddlers', label: 'Toddlers (2-4 years)', description: 'Very simple stories with short sentences' },
    { value: 'children', label: 'Children (5-8 years)', description: 'Simple and playful stories' },
    { value: 'young_teens', label: 'Young Teens (9-13 years)', description: 'More complex adventures and themes' },
    { value: 'teens', label: 'Teens (14+ years)', description: 'Sophisticated stories with deeper themes' }
  ];

  useEffect(() => {
    loadCurrentAgeRating();
  }, []);

  const loadCurrentAgeRating = async () => {
    try {
      const rating = await SecureStore.getItemAsync('ageRating');
      if (rating) {
        setCurrentAgeRating(rating);
      }
    } catch (error) {
      console.error('Error loading age rating:', error);
    }
  };

  const handleAgeRatingChange = async (rating) => {
    try {
      await SecureStore.setItemAsync('ageRating', rating);
      setCurrentAgeRating(rating);
      if (onAgeRatingChange) {
        onAgeRatingChange(rating);
      }
      Alert.alert('Success', 'Age rating updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update age rating');
    }
  };

  const styles = getStyles(darkMode);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Age Rating Settings</Text>
        <Text style={styles.subtitle}>
          {currentProfile 
            ? `Updating settings for: ${currentProfile.name}` 
            : 'Updating global settings (no profile selected)'}
        </Text>
      </View>

      <View style={styles.currentSection}>
        <Text style={styles.sectionTitle}>Current Setting:</Text>
        <Text style={styles.currentRating}>
          {ageRatings.find(r => r.value === currentAgeRating)?.label}
        </Text>
      </View>

      <View style={styles.ratingsSection}>
        <Text style={styles.sectionTitle}>Available Age Ratings:</Text>
        {ageRatings.map((rating) => (
          <TouchableOpacity
            key={rating.value}
            style={[
              styles.ratingItem,
              currentAgeRating === rating.value && styles.selectedRating
            ]}
            onPress={() => handleAgeRatingChange(rating.value)}
          >
            <Text style={[
              styles.ratingLabel,
              currentAgeRating === rating.value && styles.selectedText
            ]}>
              {rating.label}
            </Text>
            <Text style={[
              styles.ratingDescription,
              currentAgeRating === rating.value && styles.selectedText
            ]}>
              {rating.description}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const getStyles = (darkMode) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: darkMode ? '#1A202C' : '#F7FAFC',
    padding: 20,
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: darkMode ? '#E2E8F0' : '#2D3748',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: darkMode ? '#A0AEC0' : '#4A5568',
  },
  passwordSection: {
    backgroundColor: darkMode ? '#2D3748' : '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: darkMode ? '#E2E8F0' : '#2D3748',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: darkMode ? '#4A5568' : '#CBD5E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: darkMode ? '#E2E8F0' : '#2D3748',
    backgroundColor: darkMode ? '#374151' : '#F7FAFC',
    marginBottom: 15,
  },
  submitBtn: {
    backgroundColor: '#6B73FF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  currentSection: {
    backgroundColor: darkMode ? '#2D3748' : '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: darkMode ? '#E2E8F0' : '#2D3748',
    marginBottom: 12,
  },
  currentRating: {
    fontSize: 16,
    color: '#6B73FF',
    fontWeight: '500',
  },
  ratingsSection: {
    backgroundColor: darkMode ? '#2D3748' : '#FFFFFF',
    padding: 20,
    borderRadius: 12,
  },
  ratingItem: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: darkMode ? '#4A5568' : '#E2E8F0',
  },
  selectedRating: {
    borderColor: '#6B73FF',
    backgroundColor: darkMode ? '#4C51BF' : '#EBF4FF',
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: darkMode ? '#E2E8F0' : '#2D3748',
    marginBottom: 4,
  },
  ratingDescription: {
    fontSize: 14,
    color: darkMode ? '#A0AEC0' : '#4A5568',
  },
  selectedText: {
    color: darkMode ? '#FFFFFF' : '#2B6CB0',
  },
});
