import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { StatusBar, Alert } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';

import ChatInterface from './components/ChatInterface';
import ModelDownloader from './components/ModelDownloader';
import SettingsScreen from './components/SettingsScreen';
import { loadLlamaModel, generateLlamaResponse, releaseLlamaModel } from './utils/llama';

const Drawer = createDrawerNavigator();

function MainApp() {
  const { colors, isDarkMode } = useTheme();
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isInferring, setIsInferring] = useState(false);
  const [wifiOnlyDownloads, setWifiOnlyDownloads] = useState(true);
  const [showDownloader, setShowDownloader] = useState(false);

  useEffect(() => {
    return () => {
      releaseLlamaModel();
    };
  }, []);

  const handleModelReady = async (textModelPath, visionModelPath) => {
    setShowDownloader(false);
    try {
      await loadLlamaModel(textModelPath, visionModelPath);
      setIsModelLoaded(true);
      Alert.alert("Success", "Model loaded successfully!");
    } catch (error) {
      Alert.alert("Initialization Error", error.message);
    }
  };

  const handleSendMessage = async (message, onToken, onDone) => {
    setIsInferring(true);
    try {
      const messages = [
        { role: 'system', content: 'You are a helpful AI assistant. You can see images when provided.' },
        message
      ];

      if (message.image) {
        messages[1].content = `[img-base64-${message.image}] ${message.content}`;
      }

      await generateLlamaResponse(messages, onToken);
    } catch (error) {
      Alert.alert("Inference Error", error.message);
      onToken("\n\n[Error: " + error.message + "]");
    } finally {
      setIsInferring(false);
      onDone();
    }
  };

  return (
    <>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      <NavigationContainer>
        <Drawer.Navigator 
          initialRouteName="Chat"
          screenOptions={{
            headerShown: false,
            drawerStyle: {
              backgroundColor: colors.background,
              width: 280,
            },
            drawerActiveTintColor: colors.primary,
            drawerInactiveTintColor: colors.subtext,
            drawerLabelStyle: {
              fontSize: 16,
              fontWeight: '600',
            }
          }}
        >
          <Drawer.Screen name="Chat">
            {props => (
              <ChatInterface 
                {...props}
                onOpenDownloader={() => setShowDownloader(true)}
                isModelLoaded={isModelLoaded}
                onSendMessage={handleSendMessage}
                isInferring={isInferring}
              />
            )}
          </Drawer.Screen>
          <Drawer.Screen name="Settings">
            {props => (
              <SettingsScreen 
                {...props}
                wifiOnlyDownloads={wifiOnlyDownloads}
                setWifiOnlyDownloads={setWifiOnlyDownloads}
              />
            )}
          </Drawer.Screen>
        </Drawer.Navigator>
      </NavigationContainer>

      <ModelDownloader
        visible={showDownloader}
        onClose={() => setShowDownloader(false)}
        isDarkMode={isDarkMode}
        wifiOnlyDownloads={wifiOnlyDownloads}
        onModelReady={handleModelReady}
      />
    </>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <MainApp />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
