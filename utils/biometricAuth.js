import * as LocalAuthentication from 'expo-local-authentication';
import * as Storage from './storage';

export const checkBiometricSupport = async () => {
  const compatible = await LocalAuthentication.hasHardwareAsync();
  const enrolled = await LocalAuthentication.isEnrolledAsync();
  return compatible && enrolled;
};

export const authenticateWithBiometrics = async (reason = 'Authenticate to continue') => {
  try {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: reason,
      fallbackLabel: 'Use password instead',
      disableDeviceFallback: false,
    });
    return result.success;
  } catch (error) {
    console.error('Biometric auth error:', error);
    return false;
  }
};

export const saveBiometricCredentials = async (email, password) => {
  try {
    await Storage.setItemAsync('biometric_email', email);
    await Storage.setItemAsync('biometric_password', password);
    await Storage.setItemAsync('biometric_enabled', 'true');
    return true;
  } catch (error) {
    console.error('Error saving biometric credentials:', error);
    return false;
  }
};

export const getBiometricCredentials = async () => {
  try {
    const enabled = await Storage.getItemAsync('biometric_enabled');
    if (enabled !== 'true') return null;
    
    const email = await Storage.getItemAsync('biometric_email');
    const password = await Storage.getItemAsync('biometric_password');
    
    if (email && password) {
      return { email, password };
    }
    return null;
  } catch (error) {
    console.error('Error getting biometric credentials:', error);
    return null;
  }
};

export const clearBiometricCredentials = async () => {
  try {
    await Storage.deleteItemAsync('biometric_email');
    await Storage.deleteItemAsync('biometric_password');
    await Storage.deleteItemAsync('biometric_enabled');
    return true;
  } catch (error) {
    console.error('Error clearing biometric credentials:', error);
    return false;
  }
};

export const isBiometricEnabled = async () => {
  try {
    const enabled = await Storage.getItemAsync('biometric_enabled');
    return enabled === 'true';
  } catch (error) {
    return false;
  }
};
