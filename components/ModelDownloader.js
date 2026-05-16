import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Modal, ActivityIndicator, Alert } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Network from 'expo-network';

const MODELS = [
  {
    id: 'qwen2-vl-2b-instruct-q4_k_m',
    name: 'Qwen2-VL 2B (Text)',
    description: 'Main language model for text generation and reasoning. (~1.5GB)',
    url: 'https://huggingface.co/Qwen/Qwen2-VL-2B-Instruct-GGUF/resolve/main/qwen2-vl-2b-instruct-q4_k_m.gguf',
    filename: 'qwen2-vl-2b-instruct-q4_k_m.gguf'
  },
  {
    id: 'qwen2-vl-2b-instruct-mmproj',
    name: 'Qwen2-VL 2B (Vision Projector)',
    description: 'Required if you want the AI to analyze images. (~120MB)',
    url: 'https://huggingface.co/Qwen/Qwen2-VL-2B-Instruct-GGUF/resolve/main/mmproj-model-f16.gguf',
    filename: 'mmproj-model-f16.gguf'
  }
];

export default function ModelDownloader({ visible, onClose, isDarkMode, wifiOnlyDownloads, onModelReady }) {
  const themeStyles = isDarkMode ? darkStyles : lightStyles;
  const currentStyles = { ...baseStyles, ...themeStyles };

  const [downloadProgress, setDownloadProgress] = useState({});
  const [downloadTasks, setDownloadTasks] = useState({});
  const [localFiles, setLocalFiles] = useState({});

  useEffect(() => {
    checkLocalFiles();
  }, []);

  const checkLocalFiles = async () => {
    const files = {};
    for (const model of MODELS) {
      const fileUri = FileSystem.documentDirectory + model.filename;
      const info = await FileSystem.getInfoAsync(fileUri);
      if (info.exists) {
        files[model.id] = fileUri;
      }
    }
    setLocalFiles(files);
  };

  const startDownload = async (model) => {
    if (wifiOnlyDownloads) {
      const networkState = await Network.getNetworkStateAsync();
      if (networkState.type !== Network.NetworkStateType.WIFI) {
        Alert.alert("Wi-Fi Required", "You have enabled Wi-Fi only downloads, but you are not connected to Wi-Fi.");
        return;
      }
    }

    const fileUri = FileSystem.documentDirectory + model.filename;
    
    const downloadResumable = FileSystem.createDownloadResumable(
      model.url,
      fileUri,
      {},
      (downloadProgress) => {
        const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
        setDownloadProgress(prev => ({ ...prev, [model.id]: progress }));
      }
    );

    setDownloadTasks(prev => ({ ...prev, [model.id]: downloadResumable }));
    setDownloadProgress(prev => ({ ...prev, [model.id]: 0 }));

    try {
      const { uri } = await downloadResumable.downloadAsync();
      setLocalFiles(prev => ({ ...prev, [model.id]: uri }));
      setDownloadProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[model.id];
        return newProgress;
      });
      Alert.alert("Download Complete", `${model.name} has been downloaded successfully.`);
    } catch (e) {
      Alert.alert("Download Error", e.message);
      setDownloadProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[model.id];
        return newProgress;
      });
    }
  };

  const handleLoad = () => {
    const textModel = localFiles['qwen2-vl-2b-instruct-q4_k_m'];
    const visionModel = localFiles['qwen2-vl-2b-instruct-mmproj'];

    if (!textModel) {
      Alert.alert("Missing Model", "Please download the Main Text model first.");
      return;
    }

    onModelReady(textModel, visionModel || null);
  };

  const renderItem = ({ item }) => {
    const isDownloaded = !!localFiles[item.id];
    const progress = downloadProgress[item.id];
    const isDownloading = progress !== undefined;

    return (
      <View style={currentStyles.modelCard}>
        <View style={currentStyles.modelInfo}>
          <Text style={currentStyles.modelName}>{item.name}</Text>
          <Text style={currentStyles.modelDescription}>{item.description}</Text>
          {isDownloading && (
            <View style={currentStyles.progressContainer}>
              <View style={[currentStyles.progressBar, { width: `${progress * 100}%` }]} />
            </View>
          )}
        </View>
        <View style={currentStyles.actionContainer}>
          {isDownloaded ? (
            <View style={currentStyles.downloadedBadge}>
              <Text style={currentStyles.downloadedText}>Ready</Text>
            </View>
          ) : isDownloading ? (
            <ActivityIndicator size="small" color="#4A90E2" />
          ) : (
            <TouchableOpacity style={currentStyles.downloadButton} onPress={() => startDownload(item)}>
              <Text style={currentStyles.downloadButtonText}>Download</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={currentStyles.modalOverlay}>
        <View style={currentStyles.modalContent}>
          <View style={currentStyles.header}>
            <Text style={currentStyles.headerTitle}>Model Manager</Text>
            <TouchableOpacity onPress={onClose} style={currentStyles.closeButton}>
              <Text style={currentStyles.closeButtonText}>Done</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={MODELS}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            contentContainerStyle={currentStyles.listContent}
          />

          <View style={currentStyles.footer}>
            <TouchableOpacity 
              style={[currentStyles.loadButton, !localFiles['qwen2-vl-2b-instruct-q4_k_m'] && currentStyles.loadButtonDisabled]} 
              onPress={handleLoad}
              disabled={!localFiles['qwen2-vl-2b-instruct-q4_k_m']}
            >
              <Text style={currentStyles.loadButtonText}>Load Selected Models</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const baseStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    flex: 0.8,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 16,
    color: '#4A90E2',
    fontWeight: '600',
  },
  listContent: {
    gap: 16,
  },
  modelCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  modelInfo: {
    flex: 1,
    marginRight: 16,
  },
  modelName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  modelDescription: {
    fontSize: 12,
    marginBottom: 8,
  },
  actionContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
  },
  downloadButton: {
    backgroundColor: '#4A90E2',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  downloadButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  downloadedBadge: {
    backgroundColor: '#4CAF50',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  downloadedText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  progressContainer: {
    height: 4,
    backgroundColor: '#eee',
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4A90E2',
  },
  footer: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  loadButton: {
    backgroundColor: '#4A90E2',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  loadButtonDisabled: {
    backgroundColor: '#999',
  },
  loadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

const lightStyles = StyleSheet.create({
  modalContent: {
    backgroundColor: '#fff',
  },
  headerTitle: {
    color: '#000',
  },
  header: {
    borderBottomColor: '#eee',
  },
  modelCard: {
    backgroundColor: '#f9f9f9',
    borderColor: '#eee',
  },
  modelName: {
    color: '#000',
  },
  modelDescription: {
    color: '#666',
  },
  footer: {
    borderTopColor: '#eee',
  },
});

const darkStyles = StyleSheet.create({
  modalContent: {
    backgroundColor: '#1E1E1E',
  },
  headerTitle: {
    color: '#fff',
  },
  header: {
    borderBottomColor: '#2A2A2A',
  },
  modelCard: {
    backgroundColor: '#2A2A2A',
    borderColor: '#333',
  },
  modelName: {
    color: '#fff',
  },
  modelDescription: {
    color: '#AAA',
  },
  footer: {
    borderTopColor: '#2A2A2A',
  },
});
