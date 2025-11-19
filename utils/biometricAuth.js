import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

const BIOMETRIC_CREDENTIALS_KEY = 'biometric_credentials';

export const checkBiometricSupport = async () => {
  try {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    return hasHardware && isEnrolled;
  } catch (error) {
    console.log('Biometric check error:', error);
    return false;
  }
};

export const authenticateWithBiometrics = async (promptMessage = 'Authenticate') => {
  try {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage,
      fallbackLabel: 'Use Password',
      disableDeviceFallback: false,
    });
    return result.success;
  } catch (error) {
    console.log('Biometric auth error:', error);
    return false;
  }
};

export const saveBiometricCredentials = async (email, password) => {
  try {
    const credentials = JSON.stringify({ email, password });
    await SecureStore.setItemAsync(BIOMETRIC_CREDENTIALS_KEY, credentials);
    return true;
  } catch (error) {
    console.log('Save biometric credentials error:', error);
    return false;
  }
};

export const getBiometricCredentials = async () => {
  try {
    const credentials = await SecureStore.getItemAsync(BIOMETRIC_CREDENTIALS_KEY);
    return credentials ? JSON.parse(credentials) : null;
  } catch (error) {
    console.log('Get biometric credentials error:', error);
    return null;
  }
};

export const isBiometricEnabled = async () => {
  try {
    const credentials = await SecureStore.getItemAsync(BIOMETRIC_CREDENTIALS_KEY);
    return !!credentials;
  } catch (error) {
    console.log('Check biometric enabled error:', error);
    return false;
  }
};

export const clearBiometricCredentials = async () => {
  try {
    await SecureStore.deleteItemAsync(BIOMETRIC_CREDENTIALS_KEY);
    return true;
  } catch (error) {
    console.log('Clear biometric credentials error:', error);
    return false;
  }
};
