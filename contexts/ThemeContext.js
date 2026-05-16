import React, { createContext, useState, useContext, useEffect } from 'react';
import { useColorScheme } from 'react-native';

const ThemeContext = createContext();

export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  AMOLED: 'amoled',
  SYSTEM: 'system',
};

const THEME_COLORS = {
  [THEMES.LIGHT]: {
    background: '#f0f0f0',
    card: '#ffffff',
    text: '#000000',
    subtext: '#666666',
    border: '#dddddd',
    primary: '#4A90E2',
    inputBackground: '#f9f9f9',
    icon: '#333333',
  },
  [THEMES.DARK]: {
    background: '#121212',
    card: '#1E1E1E',
    text: '#ffffff',
    subtext: '#AAAAAA',
    border: '#2A2A2A',
    primary: '#4A90E2',
    inputBackground: '#2A2A2A',
    icon: '#ffffff',
  },
  [THEMES.AMOLED]: {
    background: '#000000',
    card: '#121212',
    text: '#ffffff',
    subtext: '#888888',
    border: '#222222',
    primary: '#4A90E2',
    inputBackground: '#121212',
    icon: '#ffffff',
  },
};

export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState(THEMES.DARK);

  const currentTheme = themeMode === THEMES.SYSTEM 
    ? (systemColorScheme === 'dark' ? THEMES.DARK : THEMES.LIGHT)
    : themeMode;

  const colors = THEME_COLORS[currentTheme] || THEME_COLORS[THEMES.DARK];

  return (
    <ThemeContext.Provider value={{ themeMode, setThemeMode, colors, isDarkMode: currentTheme !== THEMES.LIGHT }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
