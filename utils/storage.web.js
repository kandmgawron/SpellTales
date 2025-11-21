// Web implementation of SecureStore using localStorage
export const setItemAsync = async (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    throw error;
  }
};
export const getItemAsync = async (key) => {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    return null;
  }
};
export const deleteItemAsync = async (key) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    throw error;
  }
};
