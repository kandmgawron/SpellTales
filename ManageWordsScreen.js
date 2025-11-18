import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Alert, Modal } from 'react-native';
import { LAMBDA_URL } from './config';
import { validateInput } from './utils/security';
import { createGlobalStyles } from './styles/GlobalStyles';

export default function ManageWordsScreen({ userEmail, accessToken, darkMode, currentProfile, isOffline, onProfilesPress }) {
  const [userWords, setUserWords] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const globalStyles = createGlobalStyles(darkMode);

  useEffect(() => {
    loadUserWords();
  }, [currentProfile]);

  const loadUserWords = async () => {
    if (!userEmail) {
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(LAMBDA_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'get_words',
          userEmail: userEmail,
          profileId: currentProfile?.id || 'global'
        })
      });

      const result = await response.json();
      if (result.success && result.words) {
        setUserWords(result.words.join(', '));
      }
    } catch (error) {
    }
    setLoading(false);
  };

  const verifyPasswordAndUpdate = async () => {
    try {
      const response = await fetch(`https://cognito-idp.eu-west-2.amazonaws.com/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-amz-json-1.1',
          'X-Amz-Target': 'AWSCognitoIdentityProviderService.InitiateAuth'
        },
        body: JSON.stringify({
          AuthFlow: 'USER_PASSWORD_AUTH',
          ClientId: process.env.EXPO_PUBLIC_COGNITO_CLIENT_ID,
          AuthParameters: {
            USERNAME: userEmail,
            PASSWORD: password
          }
        })
      });

      if (response.ok) {
        setShowPasswordModal(false);
        await updateUserWords();
        setPassword('');
      } else {
        Alert.alert('Error', 'Incorrect password');
        setPassword('');
      }
    } catch (error) {
      Alert.alert('Error', 'Password verification failed');
      setPassword('');
    }
  };

  const handleUpdateWords = () => {
    setShowPasswordModal(true);
  };

  const updateUserWords = async () => {
    if (!userEmail) {
      Alert.alert('Error', 'User email is required. Please log in again.');
      return;
    }

    setLoading(true);
    try {
      const wordsArray = userWords.split(',').map(word => word.trim()).filter(word => word.length > 0);
      
      for (const word of wordsArray) {
        if (!validateInput(word, 50)) {
          Alert.alert('Error', `Invalid word: "${word}". Words must be 1-50 characters and contain only letters, numbers, spaces, and basic punctuation.`);
          setLoading(false);
          return;
        }
      }

      const payload = {
        action: 'save_words',
        userEmail: userEmail,
        profileId: currentProfile?.id || 'global',
        words: wordsArray
      };

      const response = await fetch(LAMBDA_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      
      if (result.success) {
        Alert.alert('Success', 'Words updated successfully!');
      } else {
        Alert.alert('Error', result.error || 'Failed to update words');
      }
    } catch (error) {
      Alert.alert('Error', 'Error updating words: ' + error.message);
    }
    setLoading(false);
  };

  const styles = getStyles(darkMode);

  return (
    <>
      <Text style={globalStyles.subtitle}>
        {currentProfile 
          ? `Managing words for: ${currentProfile.name}` 
          : `Managing global words for ${userEmail}`}
      </Text>

      <View style={globalStyles.section}>
        <Text style={globalStyles.cardTitle}>Learning Words</Text>
        <Text style={globalStyles.description}>
          Enter words separated by commas. These words will be included in generated stories to help with learning.
        </Text>
        
        <TextInput
          style={[globalStyles.textInput, styles.multilineInput, isOffline && {opacity: 0.5}]}
          value={userWords}
          onChangeText={setUserWords}
          placeholder="Enter words separated by commas (e.g., cat, dog, friendship, adventure)"
          placeholderTextColor={darkMode ? '#9CA3AF' : '#6B7280'}
          multiline
          numberOfLines={4}
          editable={!isOffline}
        />

        <TouchableOpacity 
          style={[globalStyles.primaryButton, (loading || isOffline) && globalStyles.buttonDisabled]} 
          onPress={isOffline ? () => Alert.alert('Offline', 'Updating words requires internet connection') : handleUpdateWords}
          disabled={loading || isOffline}
        >
          <Text style={globalStyles.buttonText}>
            {loading ? 'Updating...' : 'Update Words'}
          </Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={showPasswordModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowPasswordModal(false)}
      >
        <View style={globalStyles.modalOverlay}>
          <View style={globalStyles.modalContainer}>
            <Text style={globalStyles.modalTitle}>Enter Your Login Password</Text>
            <TextInput
              style={globalStyles.passwordInput}
              placeholder="Enter password"
              placeholderTextColor={darkMode ? '#999' : '#666'}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={true}
              autoFocus={true}
            />
            <View style={styles.passwordButtons}>
              <TouchableOpacity 
                style={[globalStyles.outlineButton, {flex: 1}]}
                onPress={() => setShowPasswordModal(false)}
              >
                <Text style={globalStyles.outlineButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[globalStyles.primaryButton, {flex: 1}]}
                onPress={verifyPasswordAndUpdate}
              >
                <Text style={globalStyles.buttonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const getStyles = (darkMode) => StyleSheet.create({
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  passwordButtons: {
    flexDirection: 'row',
    gap: 10,
  },
});
