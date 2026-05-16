import React from 'react';
import { View, Text, Switch, Modal, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';

export default function SettingsModal({ 
  visible, 
  onClose, 
  isDarkMode, 
  setIsDarkMode, 
  wifiOnlyDownloads, 
  setWifiOnlyDownloads 
}) {
  const themeStyles = isDarkMode ? darkStyles : lightStyles;
  const currentStyles = { ...baseStyles, ...themeStyles };

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
            <Text style={currentStyles.headerTitle}>Settings</Text>
            <TouchableOpacity onPress={onClose} style={currentStyles.closeButton}>
              <Text style={currentStyles.closeButtonText}>Done</Text>
            </TouchableOpacity>
          </View>

          <View style={currentStyles.settingRow}>
            <View>
              <Text style={currentStyles.settingLabel}>Dark Mode</Text>
              <Text style={currentStyles.settingDescription}>Toggle dark theme</Text>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={setIsDarkMode}
              trackColor={{ false: '#767577', true: '#4A90E2' }}
              thumbColor={'#fff'}
            />
          </View>

          <View style={currentStyles.settingRow}>
            <View>
              <Text style={currentStyles.settingLabel}>Wi-Fi Only Downloads</Text>
              <Text style={currentStyles.settingDescription}>Prevent large downloads on cellular</Text>
            </View>
            <Switch
              value={wifiOnlyDownloads}
              onValueChange={setWifiOnlyDownloads}
              trackColor={{ false: '#767577', true: '#4A90E2' }}
              thumbColor={'#fff'}
            />
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
    padding: 20,
    minHeight: 300,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
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
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 12,
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
  settingLabel: {
    color: '#000',
  },
  settingDescription: {
    color: '#666',
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
  settingLabel: {
    color: '#fff',
  },
  settingDescription: {
    color: '#AAA',
  },
});
