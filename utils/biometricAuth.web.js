// Web implementation - biometrics not available, always return false
export const checkBiometricSupport = async () => {
  return false; // Biometrics not available on web
};

export const authenticateWithBiometrics = async (reason) => {
  return false;
};

export const saveBiometricCredentials = async (email, password) => {
  return false;
};

export const getBiometricCredentials = async () => {
  return null;
};

export const clearBiometricCredentials = async () => {
  return true;
};

export const isBiometricEnabled = async () => {
  return false;
};
