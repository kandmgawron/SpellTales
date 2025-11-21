import { Platform } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
const BIOMETRIC_CREDENTIALS_KEY = 'biometric_credentials';
export const checkBiometricSupport = async () => {
  try {
    // Biometrics not supported on web
    if (Platform.OS === 'web') {
      return false;
    }
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    return hasHardware && isEnrolled;
  } catch (error) {
    return false;
  }
};
export const authenticateWithBiometrics = async (promptMessage = 'Authenticate') => {
  try {
    // Biometrics not supported on web
    if (Platform.OS === 'web') {
      return false;
    }
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage,
      fallbackLabel: 'Use Password',
      disableDeviceFallback: false,
    });
    return result.success;
  } catch (error) {
    return false;
  }
};
export const saveBiometricCredentials = async (email, password) => {
  try {
    // Biometrics not supported on web
    if (Platform.OS === 'web') {
      return false;
    }
    const credentials = JSON.stringify({ email, password });
    await SecureStore.setItemAsync(BIOMETRIC_CREDENTIALS_KEY, credentials);
    return true;
  } catch (error) {
    return false;
  }
};
export const getBiometricCredentials = async () => {
  try {
    // Biometrics not supported on web
    if (Platform.OS === 'web') {
      return null;
    }
    const credentials = await SecureStore.getItemAsync(BIOMETRIC_CREDENTIALS_KEY);
    return credentials ? JSON.parse(credentials) : null;
  } catch (error) {
    return null;
  }
};
export const isBiometricEnabled = async () => {
  try {
    // Biometrics not supported on web
    if (Platform.OS === 'web') {
      return false;
    }
    const credentials = await SecureStore.getItemAsync(BIOMETRIC_CREDENTIALS_KEY);
    return !!credentials;
  } catch (error) {
    return false;
  }
};
export const clearBiometricCredentials = async () => {
  try {
    // Biometrics not supported on web
    if (Platform.OS === 'web') {
      return true;
    }
    await SecureStore.deleteItemAsync(BIOMETRIC_CREDENTIALS_KEY);
    return true;
  } catch (error) {
    return false;
  }
};
