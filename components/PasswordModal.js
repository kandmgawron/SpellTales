import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal } from 'react-native';
import { CONFIG } from '../config';
import { createGlobalStyles } from '../styles/GlobalStyles';

export default function PasswordModal({ 
  visible, 
  darkMode, 
  userEmail, 
  onSuccess, 
  onCancel,
  title = 'Enter Your Password'
}) {
  const [password, setPassword] = useState('');
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const globalStyles = createGlobalStyles(darkMode);

  useEffect(() => {
    checkBiometrics();
  }, []);

  const checkBiometrics = async () => {
    const available = await checkBiometricSupport();
    setBiometricAvailable(available);
  };

  const handlePasswordVerify = async () => {
    try {
      const response = await fetch(`https://cognito-idp.${process.env.EXPO_PUBLIC_COGNITO_REGION}.amazonaws.com/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-amz-json-1.1',
          'X-Amz-Target': 'AWSCognitoIdentityProviderService.InitiateAuth'
        },
        body: JSON.stringify({
          AuthFlow: 'USER_PASSWORD_AUTH',
          ClientId: CONFIG.COGNITO_CLIENT_ID,
          AuthParameters: {
            USERNAME: userEmail,
            PASSWORD: password
          }
        })
      });

      const data = await response.json();
      
      if (response.ok && data.AuthenticationResult) {
        setPassword('');
        onSuccess();
      } else {
        alert('Invalid password');
      }
    } catch (error) {
      alert('Failed to verify password');
    }
  };

  const handleBiometricVerify = async () => {
    const authenticated = await authenticateWithBiometrics('Verify your identity');
    if (authenticated) {
      setPassword('');
      onSuccess();
    }
  };

  const handleCancel = () => {
    setPassword('');
    onCancel();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <View style={globalStyles.modalOverlay}>
        <View style={globalStyles.modalContainer}>
          <Text style={globalStyles.modalTitle}>{title}</Text>
          <TextInput
            style={globalStyles.passwordInput}
            placeholder="Password"
            placeholderTextColor={darkMode ? '#999' : '#666'}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={true}
            autoFocus={true}
          />
          <View style={{flexDirection: 'row', gap: 10}}>
            <TouchableOpacity 
              style={[globalStyles.outlineButton, {flex: 1}]}
              onPress={handleCancel}
            >
              <Text style={globalStyles.outlineButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[globalStyles.primaryButton, {flex: 1}]}
              onPress={handlePasswordVerify}
            >
              <Text style={globalStyles.buttonText}>Confirm</Text>
            </TouchableOpacity>
          </View>
          {biometricAvailable && (
            <TouchableOpacity 
              style={[globalStyles.linkButton, {marginTop: 10}]}
              onPress={handleBiometricVerify}
            >
              <Text style={globalStyles.linkButtonText}>🔐 Use Face ID / Touch ID</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}
