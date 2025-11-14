import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

export const checkBiometricSupport = async () => {
  const compatible = await LocalAuthentication.hasHardwareAsync();
  const enrolled = await LocalAuthentication.isEnrolledAsync();
  console.log('Biometric check - compatible:', compatible, 'enrolled:', enrolled);
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
    await SecureStore.setItemAsync('biometric_email', email);
    await SecureStore.setItemAsync('biometric_password', password);
    await SecureStore.setItemAsync('biometric_enabled', 'true');
    return true;
  } catch (error) {
    console.error('Error saving biometric credentials:', error);
    return false;
  }
};

export const getBiometricCredentials = async () => {
  try {
    const enabled = await SecureStore.getItemAsync('biometric_enabled');
    if (enabled !== 'true') return null;
    
    const email = await SecureStore.getItemAsync('biometric_email');
    const password = await SecureStore.getItemAsync('biometric_password');
    
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
    await SecureStore.deleteItemAsync('biometric_email');
    await SecureStore.deleteItemAsync('biometric_password');
    await SecureStore.deleteItemAsync('biometric_enabled');
    return true;
  } catch (error) {
    console.error('Error clearing biometric credentials:', error);
    return false;
  }
};

export const isBiometricEnabled = async () => {
  try {
    const enabled = await SecureStore.getItemAsync('biometric_enabled');
    return enabled === 'true';
  } catch (error) {
    return false;
  }
};
