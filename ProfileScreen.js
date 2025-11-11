import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Modal } from 'react-native';

export default function ProfileScreen({ darkMode, profiles, onProfilesChange, onBack, userEmail }) {
  const [newProfileName, setNewProfileName] = useState('');
  const [newProfileAge, setNewProfileAge] = useState('children');
  const [showAgeDropdown, setShowAgeDropdown] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const [pendingAction, setPendingAction] = useState(null);
  const styles = getStyles(darkMode);

  const ageOptions = [
    { label: 'Toddlers (2-4)', value: 'toddlers' },
    { label: 'Children (5-8)', value: 'children' },
    { label: 'Young Teens (9-12)', value: 'young_teens' },
    { label: 'Teens (13-17)', value: 'teens' }
  ];

  const requestPassword = (action) => {
    setPendingAction(action);
    setShowPasswordModal(true);
    setPassword('');
  };

  const verifyPassword = async () => {
    try {
      // Use Cognito to verify the current user's password
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
        if (pendingAction) {
          pendingAction();
        }
        setPendingAction(null);
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

  const addProfileAction = () => {
    if (!newProfileName.trim()) {
      Alert.alert('Error', 'Please enter a profile name');
      return;
    }
    
    if (profiles.some(p => p.name.toLowerCase() === newProfileName.trim().toLowerCase())) {
      Alert.alert('Error', 'Profile name already exists');
      return;
    }

    const newProfile = {
      id: Date.now().toString(),
      name: newProfileName.trim(),
      ageRating: newProfileAge,
      words: [],
      savedStories: [],
      createdAt: new Date().toISOString()
    };

    onProfilesChange([...profiles, newProfile]);
    setNewProfileName('');
    setNewProfileAge('children');
    Alert.alert('Success', `Profile "${newProfile.name}" created!`);
  };

  const addProfile = () => {
    requestPassword(addProfileAction);
  };

  const deleteProfile = (profileId) => {
    const deleteAction = () => {
      onProfilesChange(profiles.filter(p => p.id !== profileId));
    };

    Alert.alert(
      'Delete Profile',
      'Are you sure you want to delete this profile?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => requestPassword(deleteAction)
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Child Profiles</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Create New Profile</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter child's name"
          placeholderTextColor={darkMode ? '#999' : '#666'}
          value={newProfileName}
          onChangeText={setNewProfileName}
        />
        
        <TouchableOpacity 
          style={styles.dropdown}
          onPress={() => setShowAgeDropdown(true)}
        >
          <Text style={styles.dropdownText}>
            {ageOptions.find(a => a.value === newProfileAge)?.label || 'Select Age'}
          </Text>
          <Text style={styles.dropdownArrow}>▼</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.addBtn} onPress={addProfile}>
          <Text style={styles.addBtnText}>+ Add Profile</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Existing Profiles ({profiles.length})</Text>
        {profiles.length === 0 ? (
          <Text style={styles.emptyText}>
            No profiles created yet. Stories will use global settings.
          </Text>
        ) : (
          profiles.map(profile => (
            <View key={profile.id} style={styles.profileItem}>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>👤 {profile.name}</Text>
                <Text style={styles.profileDetails}>Age Rating: {profile.ageRating}</Text>
              </View>
              <TouchableOpacity 
                style={styles.deleteBtn}
                onPress={() => deleteProfile(profile.id)}
              >
                <Text style={styles.deleteBtnText}>🗑️</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          💡 Tip: If you have only one child, you don't need to create a profile. 
          The app will use your global age rating setting.
        </Text>
      </View>

      <Modal
        visible={showAgeDropdown}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowAgeDropdown(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          onPress={() => setShowAgeDropdown(false)}
        >
          <View style={styles.dropdownModal}>
            {ageOptions.map(option => (
              <TouchableOpacity
                key={option.value}
                style={styles.dropdownItem}
                onPress={() => {
                  setNewProfileAge(option.value);
                  setShowAgeDropdown(false);
                }}
              >
                <Text style={styles.dropdownItemText}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

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
                onPress={verifyPassword}
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
    backgroundColor: 'transparent',
    padding: 20,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backBtn: {
    backgroundColor: darkMode ? '#444' : '#e0e0e0',
    padding: 8,
    borderRadius: 5,
    marginRight: 15,
  },
  backBtnText: {
    color: darkMode ? '#fff' : '#000',
    fontSize: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: darkMode ? '#fff' : '#000',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: darkMode ? '#fff' : '#000',
    marginBottom: 15,
  },
  input: {
    backgroundColor: darkMode ? '#333' : '#fff',
    color: darkMode ? '#fff' : '#000',
    padding: 12,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: darkMode ? '#555' : '#ddd',
    marginBottom: 10,
  },
  addBtn: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
  },
  addBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  emptyText: {
    color: darkMode ? '#ccc' : '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 20,
  },
  profileItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: darkMode ? '#333' : '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: darkMode ? '#fff' : '#000',
  },
  profileDetails: {
    fontSize: 14,
    color: darkMode ? '#ccc' : '#666',
    marginTop: 2,
  },
  deleteBtn: {
    padding: 8,
  },
  deleteBtnText: {
    fontSize: 18,
  },
  infoBox: {
    backgroundColor: darkMode ? '#2a4a6b' : '#e3f2fd',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
  },
  dropdown: {
    backgroundColor: darkMode ? '#333' : '#fff',
    borderWidth: 1,
    borderColor: darkMode ? '#555' : '#ddd',
    borderRadius: 5,
    padding: 12,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownText: {
    color: darkMode ? '#fff' : '#000',
    fontSize: 16,
  },
  dropdownArrow: {
    color: darkMode ? '#fff' : '#000',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownModal: {
    backgroundColor: darkMode ? '#333' : '#fff',
    borderRadius: 10,
    margin: 20,
    maxHeight: 300,
  },
  dropdownItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: darkMode ? '#555' : '#eee',
  },
  dropdownItemText: {
    color: darkMode ? '#fff' : '#000',
    fontSize: 16,
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
  infoText: {
    color: darkMode ? '#87ceeb' : '#1976d2',
    fontSize: 14,
    lineHeight: 20,
  },
});
