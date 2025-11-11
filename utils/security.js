export const validateInput = (input, maxLength = 1000) => {
  if (!input || typeof input !== 'string' || input.length > maxLength) return false;
  return !/<script|javascript:|data:|vbscript:/i.test(input);
};
