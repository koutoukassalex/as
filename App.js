import React, { useState, useEffect } from 'react';
import { SafeAreaView, StatusBar, Alert, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import ChatInterface from './components/ChatInterface';
import ModelDownloader from './components/ModelDownloader';
import SettingsModal from './components/SettingsModal';
import { loadLlamaModel, generateLlamaResponse, releaseLlamaModel } from './utils/llama';

export default function App() {
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isInferring, setIsInferring] = useState(false);
  
  // Settings State
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [wifiOnlyDownloads, setWifiOnlyDownloads] = useState(true);
  
  // Modal Visibility State
  const [showDownloader, setShowDownloader] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    return () => {
      // Cleanup when unmounting
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
    <SafeAreaProvider>
      <SafeAreaView style={[styles.container, isDarkMode ? styles.darkContainer : styles.lightContainer]}>
        <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
        
        <ChatInterface 
          onOpenDownloader={() => setShowDownloader(true)}
          onOpenSettings={() => setShowSettings(true)}
          isModelLoaded={isModelLoaded}
          onSendMessage={handleSendMessage}
          isInferring={isInferring}
          isDarkMode={isDarkMode}
        />

        <ModelDownloader
          visible={showDownloader}
          onClose={() => setShowDownloader(false)}
          isDarkMode={isDarkMode}
          wifiOnlyDownloads={wifiOnlyDownloads}
          onModelReady={handleModelReady}
        />

        <SettingsModal
          visible={showSettings}
          onClose={() => setShowSettings(false)}
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
          wifiOnlyDownloads={wifiOnlyDownloads}
          setWifiOnlyDownloads={setWifiOnlyDownloads}
        />

      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  darkContainer: {
    backgroundColor: '#121212',
  },
  lightContainer: {
    backgroundColor: '#f0f0f0',
  },
});
