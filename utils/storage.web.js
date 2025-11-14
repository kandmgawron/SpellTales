// Web implementation of SecureStore using localStorage
export const setItemAsync = async (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    console.error('Error saving to localStorage:', error);
    throw error;
  }
};

export const getItemAsync = async (key) => {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return null;
  }
};

export const deleteItemAsync = async (key) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error deleting from localStorage:', error);
    throw error;
  }
};
