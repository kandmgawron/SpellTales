import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Alert, Modal } from 'react-native';
import { API_CONFIG } from './config';
import { hashPassword, validateInput } from './utils/security';

export default function ManageWordsScreen({ userEmail, accessToken, darkMode, currentProfile }) {
  const [userWords, setUserWords] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUserWords();
  }, []);

  const loadUserWords = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_CONFIG.LAMBDA_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'get_user_words',
          userEmail: userEmail
        })
      });

      const result = await response.json();
      if (result.success && result.words) {
        setUserWords(result.words.join(', '));
      }
    } catch (error) {
      console.error('Error loading words:', error);
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

      const response = await fetch(API_CONFIG.LAMBDA_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'update_user_words',
          userEmail: userEmail,
          words: wordsArray,
          passwordHash: await hashPassword(password)
        })
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
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Word Management</Text>
        <Text style={styles.subtitle}>
          {currentProfile 
            ? `Managing words for: ${currentProfile.name}` 
            : `Managing global words for ${userEmail}`}
        </Text>
      </View>

      <View style={styles.wordsSection}>
        <Text style={styles.sectionTitle}>Learning Words</Text>
        <Text style={styles.description}>
          Enter words separated by commas. These words will be included in generated stories to help with learning.
        </Text>
        
        <TextInput
          style={styles.wordsInput}
          value={userWords}
          onChangeText={setUserWords}
          placeholder="Enter words separated by commas (e.g., cat, dog, friendship, adventure)"
          placeholderTextColor={darkMode ? '#9CA3AF' : '#6B7280'}
          multiline
          numberOfLines={4}
        />

        <TouchableOpacity 
          style={[styles.updateBtn, loading && styles.disabledBtn]} 
          onPress={handleUpdateWords}
          disabled={loading}
        >
          <Text style={styles.btnText}>
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
        <View style={styles.modalOverlay}>
          <View style={styles.passwordModal}>
            <Text style={styles.passwordTitle}>Enter Your Login Password</Text>
            <TextInput
              style={styles.passwordInput}
              placeholder="Enter password"
              placeholderTextColor={darkMode ? '#999' : '#666'}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={true}
              autoFocus={true}
            />
            <View style={styles.passwordButtons}>
              <TouchableOpacity 
                style={[styles.passwordBtn, styles.cancelBtn]}
                onPress={() => setShowPasswordModal(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.passwordBtn, styles.confirmBtn]}
                onPress={verifyPasswordAndUpdate}
              >
                <Text style={styles.confirmBtnText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  wordsSection: {
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
  description: {
    fontSize: 14,
    color: darkMode ? '#A0AEC0' : '#4A5568',
    marginBottom: 16,
    lineHeight: 20,
  },
  wordsInput: {
    borderWidth: 1,
    borderColor: darkMode ? '#4A5568' : '#CBD5E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: darkMode ? '#E2E8F0' : '#2D3748',
    backgroundColor: darkMode ? '#374151' : '#F7FAFC',
    marginBottom: 20,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  updateBtn: {
    backgroundColor: '#48BB78',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledBtn: {
    backgroundColor: '#A0AEC0',
  },
  btnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  passwordModal: {
    backgroundColor: darkMode ? '#333' : '#fff',
    borderRadius: 10,
    padding: 20,
    margin: 20,
    minWidth: 300,
  },
  passwordTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: darkMode ? '#fff' : '#000',
    textAlign: 'center',
    marginBottom: 15,
  },
  passwordInput: {
    backgroundColor: darkMode ? '#444' : '#f5f5f5',
    color: darkMode ? '#fff' : '#000',
    padding: 12,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: darkMode ? '#555' : '#ddd',
    marginBottom: 15,
    fontSize: 16,
  },
  passwordButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  passwordBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
  },
  cancelBtn: {
    backgroundColor: darkMode ? '#555' : '#ddd',
  },
  confirmBtn: {
    backgroundColor: '#4CAF50',
  },
  cancelBtnText: {
    color: darkMode ? '#fff' : '#000',
    fontWeight: 'bold',
  },
  confirmBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
