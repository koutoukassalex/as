import React, { createContext, useState, useContext, useEffect } from 'react';
import { useColorScheme } from 'react-native';

const ThemeContext = createContext();

export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  AMOLED: 'amoled',
  OCEAN: 'ocean',
  FOREST: 'forest',
  SUNSET: 'sunset',
  LAVENDER: 'lavender',
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
  [THEMES.OCEAN]: {
    background: '#001b2e',
    card: '#002a45',
    text: '#e1eef6',
    subtext: '#8ecae6',
    border: '#003554',
    primary: '#219ebc',
    inputBackground: '#003554',
    icon: '#8ecae6',
  },
  [THEMES.FOREST]: {
    background: '#0b130e',
    card: '#1b2a22',
    text: '#e8f3ee',
    subtext: '#76a88f',
    border: '#22362c',
    primary: '#52b788',
    inputBackground: '#22362c',
    icon: '#76a88f',
  },
  [THEMES.SUNSET]: {
    background: '#1a0d1d',
    card: '#2d1633',
    text: '#ffeeee',
    subtext: '#ff8888',
    border: '#3d1e45',
    primary: '#fb5607',
    inputBackground: '#3d1e45',
    icon: '#ff8888',
  },
  [THEMES.LAVENDER]: {
    background: '#15131a',
    card: '#231f2b',
    text: '#f4f1ff',
    subtext: '#b3a9cc',
    border: '#2e2938',
    primary: '#9d81e1',
    inputBackground: '#2e2938',
    icon: '#b3a9cc',
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
