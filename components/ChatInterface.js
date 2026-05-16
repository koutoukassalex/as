import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Image, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { ImagePlus, Send, Menu, Download } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigation } from '@react-navigation/native';

export default function ChatInterface({ onOpenDownloader, isModelLoaded, onSendMessage, isInferring }) {
  const { colors, isDarkMode } = useTheme();
  const navigation = useNavigation();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0]);
    }
  };

  const handleSend = async () => {
    if ((!input.trim() && !selectedImage) || !isModelLoaded || isInferring) return;

    const newMessage = {
      role: 'user',
      content: input,
      image: selectedImage?.base64,
      imageUri: selectedImage?.uri,
    };

    setMessages((prev) => [...prev, newMessage]);
    setInput('');
    setSelectedImage(null);

    const assistantMessagePlaceholder = { role: 'assistant', content: '', isGenerating: true };
    setMessages((prev) => [...prev, assistantMessagePlaceholder]);

    await onSendMessage(newMessage, (partialText) => {
      setMessages((prev) => {
        const newMessages = [...prev];
        const lastMsg = newMessages[newMessages.length - 1];
        lastMsg.content += partialText;
        return newMessages;
      });
    }, () => {
       setMessages((prev) => {
        const newMessages = [...prev];
        const lastMsg = newMessages[newMessages.length - 1];
        lastMsg.isGenerating = false;
        return newMessages;
      });
    });
  };

  const renderMessage = ({ item }) => (
    <View style={[
      styles.messageBubble, 
      item.role === 'user' ? styles.userMessage : { backgroundColor: colors.card },
      { alignSelf: item.role === 'user' ? 'flex-end' : 'flex-start' }
    ]}>
      {item.imageUri && (
        <Image source={{ uri: item.imageUri }} style={styles.messageImage} />
      )}
      {item.content ? (
        <Text style={{ color: item.role === 'user' ? '#fff' : colors.text, fontSize: 16, lineHeight: 24 }}>
          {item.content}
        </Text>
      ) : item.isGenerating ? (
        <ActivityIndicator size="small" color={item.role === 'user' ? "#fff" : colors.primary} />
      ) : null}
    </View>
  );

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: colors.background }]} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.openDrawer()}>
          <Menu size={24} color={colors.icon} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Qwen2-VL Local</Text>
        <TouchableOpacity style={styles.iconButton} onPress={onOpenDownloader}>
          <Download size={24} color={isModelLoaded ? "#4CAF50" : colors.icon} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={styles.messageList}
      />

      {selectedImage && (
        <View style={styles.imagePreviewContainer}>
          <Image source={{ uri: selectedImage.uri }} style={styles.imagePreview} />
          <TouchableOpacity style={styles.removeImage} onPress={() => setSelectedImage(null)}>
            <Text style={styles.removeImageText}>✕</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={[styles.inputContainer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <TouchableOpacity style={styles.iconButton} onPress={pickImage} disabled={isInferring}>
          <ImagePlus size={24} color={isModelLoaded ? colors.primary : "#999"} />
        </TouchableOpacity>
        
        <TextInput
          style={[styles.textInput, { color: colors.text, backgroundColor: colors.inputBackground }]}
          placeholder={isModelLoaded ? "Ask Qwen2-VL something..." : "Please load a model first..."}
          placeholderTextColor={colors.subtext}
          value={input}
          onChangeText={setInput}
          multiline
          editable={isModelLoaded && !isInferring}
        />
        
        <TouchableOpacity 
          style={[styles.sendButton, { backgroundColor: colors.primary }, (!input.trim() && !selectedImage) || !isModelLoaded || isInferring ? { backgroundColor: '#999' } : null]} 
          onPress={handleSend}
          disabled={(!input.trim() && !selectedImage) || !isModelLoaded || isInferring}
        >
          <Send size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  iconButton: {
    padding: 4,
  },
  messageList: {
    padding: 16,
    gap: 12,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
  },
  userMessage: {
    backgroundColor: '#4A90E2',
    borderBottomRightRadius: 4,
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 8,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
    gap: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    maxHeight: 100,
    paddingTop: 12,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePreviewContainer: {
    padding: 12,
    position: 'relative',
    alignSelf: 'flex-start',
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removeImage: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeImageText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
