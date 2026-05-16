import React, { useState, useEffect } from 'react';
import { View, StatusBar, Alert, Modal, StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';

import ChatInterface from './components/ChatInterface';
import ModelDownloader from './components/ModelDownloader';
import SettingsScreen from './components/SettingsScreen';
import { loadLlamaModel, generateLlamaResponse, releaseLlamaModel } from './utils/llama';

function MainApp() {
  const { colors, isDarkMode } = useTheme();
  const [nativeModuleError, setNativeModuleError] = useState(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isInferring, setIsInferring] = useState(false);
  const [wifiOnlyDownloads, setWifiOnlyDownloads] = useState(true);
  const [showDownloader, setShowDownloader] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    // Basic check for native module
    try {
      const { initLlama } = require('llama.rn');
      if (!initLlama) throw new Error('initLlama is undefined');
    } catch (e) {
      console.error("Native module check failed:", e);
      setNativeModuleError("Llama native module is missing. This usually happens if 'npx expo prebuild' failed or the plugin was removed.");
    }

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
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      
      {nativeModuleError && (
        <View style={{ backgroundColor: '#FF5252', padding: 12 }}>
          <Text style={{ color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>{nativeModuleError}</Text>
        </View>
      )}

      <ChatInterface 
        onOpenDownloader={() => setShowDownloader(true)}
        onOpenSettings={() => setShowSettings(true)}
        isModelLoaded={isModelLoaded}
        onSendMessage={handleSendMessage}
        isInferring={isInferring}
      />

      <Modal visible={showSettings} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowSettings(false)}>
        <View style={{ flex: 1, backgroundColor: colors.background }}>
          <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: 'row', justifyContent: 'center' }}>
            <View style={{ width: 40, height: 5, borderRadius: 3, backgroundColor: colors.subtext, opacity: 0.3 }} />
          </View>
          <SettingsScreen 
            wifiOnlyDownloads={wifiOnlyDownloads}
            setWifiOnlyDownloads={setWifiOnlyDownloads}
          />
        </View>
      </Modal>

      <ModelDownloader
        visible={showDownloader}
        onClose={() => setShowDownloader(false)}
        isDarkMode={isDarkMode}
        wifiOnlyDownloads={wifiOnlyDownloads}
        onModelReady={handleModelReady}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <MainApp />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
