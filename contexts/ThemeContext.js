import React, { createContext, useContext } from 'react';
import { createGlobalStyles, Colors } from '../styles/GlobalStyles';

const ThemeContext = createContext();

export const ThemeProvider = ({ children, darkMode }) => {
  const theme = {
    colors: Colors[darkMode ? 'dark' : 'light'],
    styles: createGlobalStyles(darkMode),
    darkMode,
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
