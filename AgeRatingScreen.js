import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView, StyleSheet } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { createGlobalStyles } from './styles/GlobalStyles';
import PasswordModal from './components/PasswordModal';

export default function AgeRatingScreen({ darkMode, userEmail, accessToken, onAgeRatingChange, currentProfile, isOffline }) {
  console.log('AgeRatingScreen component mounted');
  const [currentAgeRating, setCurrentAgeRating] = useState('children');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [pendingRating, setPendingRating] = useState(null);
  const globalStyles = createGlobalStyles(darkMode);

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
    }
  };

  const requestPasswordForChange = (rating) => {
    if (isOffline) {
      Alert.alert('Offline', 'Age rating changes require internet connection');
      return;
    }
    setPendingRating(rating);
    setShowPasswordModal(true);
  };

  const handlePasswordSuccess = async () => {
    if (pendingRating) {
      setShowPasswordModal(false);
      await handleAgeRatingChange(pendingRating);
      setPendingRating(null);
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
    <ScrollView style={globalStyles.container}>
      <View style={styles.header}>
        <Text style={globalStyles.cardTitle}>Age Rating Settings</Text>
        <Text style={globalStyles.subtitle}>
          {currentProfile 
            ? `Updating settings for: ${currentProfile.name}` 
            : 'Updating global settings (no profile selected)'}
        </Text>
      </View>

      <View style={globalStyles.section}>
        <Text style={globalStyles.cardTitle}>Current Setting:</Text>
        <Text style={globalStyles.bodyText}>
          {ageRatings.find(r => r.value === currentAgeRating)?.label}
        </Text>
      </View>

      <View style={globalStyles.section}>
        <Text style={globalStyles.cardTitle}>Available Age Ratings:</Text>
        <View style={styles.grid}>
          {ageRatings.map((rating) => (
            <TouchableOpacity
              key={rating.value}
              style={[
                globalStyles.iconButton,
                currentAgeRating === rating.value && globalStyles.iconButtonSelected,
                styles.ratingButton
              ]}
              onPress={() => requestPasswordForChange(rating.value)}
            >
              <Text style={globalStyles.iconButtonText}>
                {rating.label}
              </Text>
              <Text style={[globalStyles.iconButtonText, styles.description]}>
                {rating.description}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <PasswordModal
        visible={showPasswordModal}
        darkMode={darkMode}
        userEmail={userEmail}
        onSuccess={handlePasswordSuccess}
        onCancel={() => {
          setShowPasswordModal(false);
          setPendingRating(null);
        }}
        title="Enter Your Password"
      />
    </ScrollView>
  );
}

const getStyles = (darkMode) => StyleSheet.create({
  header: {
    marginBottom: 30,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  ratingButton: {
    width: '48%',
    minHeight: 100,
  },
  description: {
    fontSize: 10,
    marginTop: 4,
  },
  passwordButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
});
