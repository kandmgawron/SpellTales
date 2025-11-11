import * as Crypto from 'expo-crypto';

export const hashPassword = async (password) => {
  return await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    password + 'bedtime_salt_2024'
  );
};

export const validateInput = (input, maxLength = 1000) => {
  if (!input || typeof input !== 'string') return false;
  if (input.length > maxLength) return false;
  // Basic XSS prevention
  const dangerous = /<script|javascript:|data:|vbscript:/i;
  return !dangerous.test(input);
};
