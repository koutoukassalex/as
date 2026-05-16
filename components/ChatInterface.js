import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Image, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { ImagePlus, Send, Settings, Download } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';

export default function ChatInterface({ onOpenDownloader, onOpenSettings, isModelLoaded, isInferring, isDarkMode }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);

  const themeStyles = isDarkMode ? darkStyles : lightStyles;
  const currentStyles = { ...baseStyles, ...themeStyles };
  const iconColor = isDarkMode ? "#fff" : "#333";

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
    <View style={[currentStyles.messageBubble, item.role === 'user' ? currentStyles.userMessage : currentStyles.aiMessage]}>
      {item.imageUri && (
        <Image source={{ uri: item.imageUri }} style={currentStyles.messageImage} />
      )}
      {item.content ? (
        <Text style={item.role === 'user' ? currentStyles.userMessageText : currentStyles.aiMessageText}>{item.content}</Text>
      ) : item.isGenerating ? (
        <ActivityIndicator size="small" color={item.role === 'user' ? "#fff" : iconColor} />
      ) : null}
    </View>
  );

  return (
    <KeyboardAvoidingView 
      style={currentStyles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      <View style={currentStyles.header}>
        <Text style={currentStyles.headerTitle}>Qwen2-VL Local</Text>
        <View style={currentStyles.headerActions}>
          <TouchableOpacity style={currentStyles.iconButton} onPress={onOpenDownloader}>
            <Download size={24} color={isModelLoaded ? "#4CAF50" : iconColor} />
          </TouchableOpacity>
          <TouchableOpacity style={currentStyles.iconButton} onPress={onOpenSettings}>
            <Settings size={24} color={iconColor} />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={currentStyles.messageList}
      />

      {selectedImage && (
        <View style={currentStyles.imagePreviewContainer}>
          <Image source={{ uri: selectedImage.uri }} style={currentStyles.imagePreview} />
          <TouchableOpacity style={currentStyles.removeImage} onPress={() => setSelectedImage(null)}>
            <Text style={currentStyles.removeImageText}>✕</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={currentStyles.inputContainer}>
        <TouchableOpacity style={currentStyles.iconButton} onPress={pickImage} disabled={isInferring}>
          <ImagePlus size={24} color={isModelLoaded ? "#4A90E2" : "#999"} />
        </TouchableOpacity>
        
        <TextInput
          style={currentStyles.textInput}
          placeholder={isModelLoaded ? "Ask Qwen2-VL something..." : "Please load a model first..."}
          placeholderTextColor={isDarkMode ? "#666" : "#999"}
          value={input}
          onChangeText={setInput}
          multiline
          editable={isModelLoaded && !isInferring}
        />
        
        <TouchableOpacity 
          style={[currentStyles.sendButton, (!input.trim() && !selectedImage) || !isModelLoaded || isInferring ? currentStyles.sendButtonDisabled : null]} 
          onPress={handleSend}
          disabled={(!input.trim() && !selectedImage) || !isModelLoaded || isInferring}
        >
          <Send size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const baseStyles = StyleSheet.create({
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
  headerActions: {
    flexDirection: 'row',
    gap: 12,
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
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#4A90E2',
    borderBottomRightRadius: 4,
  },
  aiMessage: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  userMessageText: {
    color: '#fff',
    fontSize: 16,
    lineHeight: 24,
  },
  aiMessageText: {
    fontSize: 16,
    lineHeight: 24,
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
    backgroundColor: '#4A90E2',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#999',
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

const lightStyles = StyleSheet.create({
  container: {
    backgroundColor: '#f0f0f0',
  },
  header: {
    borderBottomColor: '#ddd',
  },
  headerTitle: {
    color: '#000',
  },
  aiMessage: {
    backgroundColor: '#fff',
  },
  aiMessageText: {
    color: '#000',
  },
  inputContainer: {
    borderTopColor: '#ddd',
    backgroundColor: '#fff',
  },
  textInput: {
    color: '#000',
    backgroundColor: '#f9f9f9',
  },
});

const darkStyles = StyleSheet.create({
  container: {
    backgroundColor: '#121212',
  },
  header: {
    borderBottomColor: '#2A2A2A',
  },
  headerTitle: {
    color: '#fff',
  },
  aiMessage: {
    backgroundColor: '#2A2A2A',
  },
  aiMessageText: {
    color: '#fff',
  },
  inputContainer: {
    borderTopColor: '#2A2A2A',
    backgroundColor: '#1E1E1E',
  },
  textInput: {
    color: '#fff',
    backgroundColor: '#2A2A2A',
  },
});
