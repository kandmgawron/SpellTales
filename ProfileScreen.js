import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Modal } from 'react-native';
import { createGlobalStyles } from './styles/GlobalStyles';
import { checkBiometricSupport, authenticateWithBiometrics } from './utils/biometricAuth';

export default function ProfileScreen({ darkMode, profiles, onProfilesChange, onDeleteProfile, onBack, userEmail, isOffline }) {
  console.log('ProfileScreen mounted');
  const [newProfileName, setNewProfileName] = useState('');
  const [newProfileAge, setNewProfileAge] = useState('children');
  const [showAgeDropdown, setShowAgeDropdown] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const [pendingAction, setPendingAction] = useState(null);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const globalStyles = createGlobalStyles(darkMode);
  const styles = getStyles(darkMode);

  useEffect(() => {
    checkBiometrics();
  }, []);

  const checkBiometrics = async () => {
    const available = await checkBiometricSupport();
    console.log('Biometric available in ProfileScreen:', available);
    setBiometricAvailable(available);
    console.log('Set biometricAvailable to:', available);
  };

  const ageOptions = [
    { label: 'Toddlers (2-4)', value: 'toddlers' },
    { label: 'Children (5-8)', value: 'children' },
    { label: 'Young Teens (9-12)', value: 'young_teens' },
    { label: 'Teens (13-17)', value: 'teens' }
  ];

  const requestPassword = (action) => {
    setPendingAction(() => action);
    setShowPasswordModal(true);
    setPassword('');
  };

  const verifyWithBiometrics = async () => {
    const authenticated = await authenticateWithBiometrics('Verify your identity');
    if (authenticated && pendingAction) {
      setShowPasswordModal(false);
      pendingAction();
      setPendingAction(null);
      setPassword('');
    }
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
    
    if (profiles.length >= 5) {
      Alert.alert('Limit Reached', 'You can only create up to 5 profiles. Please delete an existing profile first.');
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
  };

  const addProfile = () => {
    addProfileAction();
  };

  const deleteProfile = (profileId) => {
    Alert.alert(
      'Delete Profile',
      'Are you sure you want to delete this profile? All saved stories and words will be permanently removed.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => requestPassword(() => onDeleteProfile(profileId))
        }
      ]
    );
  };

  const editProfileAge = (profileId) => {
    const profile = profiles.find(p => p.id === profileId);
    if (!profile) return;
    
    Alert.alert(
      'Change Age Rating',
      'Select new age rating for this profile:',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Toddlers (2-4)', onPress: () => requestPassword(() => {
          updateProfileAge(profileId, 'toddlers');
          Alert.alert('Success', 'Age rating updated successfully!');
        }) },
        { text: 'Children (5-8)', onPress: () => requestPassword(() => {
          updateProfileAge(profileId, 'children');
          Alert.alert('Success', 'Age rating updated successfully!');
        }) },
        { text: 'Young Teens (9-12)', onPress: () => requestPassword(() => {
          updateProfileAge(profileId, 'young_teens');
          Alert.alert('Success', 'Age rating updated successfully!');
        }) },
        { text: 'Teens (13-17)', onPress: () => requestPassword(() => {
          updateProfileAge(profileId, 'teens');
          Alert.alert('Success', 'Age rating updated successfully!');
        }) }
      ]
    );
  };

  const updateProfileAge = (profileId, newAgeRating) => {
    const updatedProfiles = profiles.map(p => 
      p.id === profileId ? { ...p, ageRating: newAgeRating } : p
    );
    onProfilesChange(updatedProfiles);
  };

  return (
    <ScrollView style={globalStyles.screenContainer}>
      <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20}}>
        <TouchableOpacity style={globalStyles.homeButton} onPress={onBack}>
          <Text style={globalStyles.homeButtonText}>🏠 Home</Text>
        </TouchableOpacity>
        <Text style={globalStyles.heading}>Child Profiles</Text>
      </View>

      <View style={globalStyles.section}>
        <Text style={globalStyles.cardTitle}>Create New Profile</Text>
        <TextInput
          style={globalStyles.textInput}
          placeholder="Enter child's name"
          placeholderTextColor={darkMode ? '#999' : '#666'}
          value={newProfileName}
          onChangeText={setNewProfileName}
        />
        
        <TouchableOpacity 
          style={globalStyles.genreDropdown}
          onPress={() => setShowAgeDropdown(true)}
        >
          <Text style={globalStyles.dropdownText}>
            {ageOptions.find(a => a.value === newProfileAge)?.label || 'Select Age'}
          </Text>
          <Text style={globalStyles.dropdownArrow}>▼</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[globalStyles.primaryButton, isOffline && globalStyles.buttonDisabled]} 
          onPress={() => isOffline ? Alert.alert('Offline', 'Profile creation requires internet connection') : addProfile()}
          disabled={isOffline}
        >
          <Text style={globalStyles.buttonText}>Add Profile</Text>
        </TouchableOpacity>
      </View>

      <View style={globalStyles.section}>
        <Text style={globalStyles.cardTitle}>Existing Profiles ({profiles.length})</Text>
        {profiles.length === 0 ? (
          <Text style={globalStyles.description}>
            No profiles created yet. Stories will use global settings.
          </Text>
        ) : (
          profiles.map(profile => (
            <View key={profile.id} style={[globalStyles.card, styles.profileItem]}>
              <View style={styles.profileInfo}>
                <Text style={globalStyles.bodyText}>👤 {profile.name}</Text>
                <Text style={globalStyles.description}>
                  {ageOptions.find(a => a.value === profile.ageRating)?.label || profile.ageRating}
                </Text>
              </View>
              <View style={styles.profileActions}>
                <TouchableOpacity 
                  style={[styles.actionBtn, isOffline && {opacity: 0.5}]}
                  onPress={() => isOffline ? Alert.alert('Offline', 'Profile editing requires internet connection') : editProfileAge(profile.id)}
                  disabled={isOffline}
                >
                  <Text style={styles.actionBtnText}>✏️</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.actionBtn, isOffline && {opacity: 0.5}]}
                  onPress={() => isOffline ? Alert.alert('Offline', 'Profile deletion requires internet connection') : deleteProfile(profile.id)}
                  disabled={isOffline}
                >
                  <Text style={styles.actionBtnText}>🗑️</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </View>

      <View style={globalStyles.section}>
        <Text style={globalStyles.description}>
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
          style={globalStyles.modalOverlay}
          onPress={() => setShowAgeDropdown(false)}
        >
          <View style={globalStyles.modalContainer}>
            {ageOptions.map(option => (
              <TouchableOpacity
                key={option.value}
                style={styles.dropdownItem}
                onPress={() => {
                  setNewProfileAge(option.value);
                  setShowAgeDropdown(false);
                }}
              >
                <Text style={globalStyles.bodyText}>{option.label}</Text>
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
                onPress={verifyPassword}
              >
                <Text style={globalStyles.buttonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
            {console.log('Rendering modal, biometricAvailable:', biometricAvailable)}
            {biometricAvailable && (
              <TouchableOpacity 
                style={[globalStyles.linkButton, {marginTop: 10}]}
                onPress={verifyWithBiometrics}
              >
                <Text style={globalStyles.linkButtonText}>🔐 Use Face ID / Touch ID</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const getStyles = (darkMode) => StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  profileInfo: {
    flex: 1,
  },
  profileActions: {
    flexDirection: 'row',
    gap: 5,
  },
  actionBtn: {
    padding: 8,
  },
  actionBtnText: {
    fontSize: 20,
  },
  dropdownItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: darkMode ? '#555' : '#eee',
  },
  passwordButtons: {
    flexDirection: 'row',
    gap: 10,
  },
});
