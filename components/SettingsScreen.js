import React from 'react';
import { View, Text, Switch, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useTheme, THEMES } from '../contexts/ThemeContext';

export default function SettingsScreen({ wifiOnlyDownloads, setWifiOnlyDownloads }) {
  const { themeMode, setThemeMode, colors } = useTheme();

  const renderThemeOption = (label, mode) => (
    <TouchableOpacity 
      style={[
        styles.themeOption, 
        { borderColor: themeMode === mode ? colors.primary : colors.border }
      ]}
      onPress={() => setThemeMode(mode)}
    >
      <Text style={[styles.themeOptionText, { color: colors.text }]}>{label}</Text>
      {themeMode === mode && <View style={[styles.radioDot, { backgroundColor: colors.primary }]} />}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>Appearance</Text>
        
        <View style={styles.themeContainer}>
          {renderThemeOption('Light', THEMES.LIGHT)}
          {renderThemeOption('Dark', THEMES.DARK)}
          {renderThemeOption('AMOLED', THEMES.AMOLED)}
          {renderThemeOption('System', THEMES.SYSTEM)}
        </View>
      </View>

      <View style={[styles.section, { borderTopColor: colors.border, borderTopWidth: 1, marginTop: 20, paddingTop: 20 }]}>
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>Download Preferences</Text>
        
        <View style={styles.settingRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>Wi-Fi Only Downloads</Text>
            <Text style={[styles.settingDescription, { color: colors.subtext }]}>Prevent large downloads on cellular</Text>
          </View>
          <Switch
            value={wifiOnlyDownloads}
            onValueChange={setWifiOnlyDownloads}
            trackColor={{ false: '#767577', true: colors.primary }}
            thumbColor={'#fff'}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 16,
    letterSpacing: 1,
  },
  themeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    minWidth: '45%',
  },
  themeOptionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 12,
  },
});
