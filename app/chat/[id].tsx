import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';

const { width } = Dimensions.get('window');

// Mock messages data - will be replaced with real data from store in Component 2
const mockMessages = [
  {
    id: '1',
    senderId: '2',
    receiverId: '1',
    content: 'Hey! How are you doing?',
    timestamp: new Date(Date.now() - 3600000), // 1 hour ago
    isRead: true,
  },
  {
    id: '2',
    senderId: '1',
    receiverId: '2',
    content: 'Hi! I\'m doing great, thanks for asking. How about you?',
    timestamp: new Date(Date.now() - 3000000), // 50 minutes ago
    isRead: true,
  },
  {
    id: '3',
    senderId: '2',
    receiverId: '1',
    content: 'That\'s awesome! I\'m having a great day too. I saw your profile and loved your hiking photos!',
    timestamp: new Date(Date.now() - 2400000), // 40 minutes ago
    isRead: true,
  },
  {
    id: '4',
    senderId: '1',
    receiverId: '2',
    content: 'Thank you! I love hiking. Do you enjoy outdoor activities too?',
    timestamp: new Date(Date.now() - 1800000), // 30 minutes ago
    isRead: true,
  },
  {
    id: '5',
    senderId: '2',
    receiverId: '1',
    content: 'Absolutely! I go hiking almost every weekend. Maybe we could go together sometime? 🏔️',
    timestamp: new Date(Date.now() - 300000), // 5 minutes ago
    isRead: false,
  },
];

// Mock user data
const mockUsers = {
  '1': { name: 'You', photo: '' }, // Current user
  '2': { name: 'Sarah', photo: 'https://images.unsplash.com/photo-1494790108755-2616b612b515?w=400' },
};

interface MessageBubbleProps {
  message: typeof mockMessages[0];
  isOwn: boolean;
}

function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <View style={[
      styles.messageContainer,
      isOwn ? styles.ownMessageContainer : styles.otherMessageContainer
    ]}>
      <View style={[
        styles.messageBubble,
        isOwn ? styles.ownMessageBubble : styles.otherMessageBubble
      ]}>
        <Text style={[
          styles.messageText,
          isOwn ? styles.ownMessageText : styles.otherMessageText
        ]}>
          {message.content}
        </Text>
        <Text style={[
          styles.messageTime,
          isOwn ? styles.ownMessageTime : styles.otherMessageTime
        ]}>
          {formatTime(message.timestamp)}
        </Text>
      </View>
    </View>
  );
}

export default function ChatDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [messages, setMessages] = useState(mockMessages);
  const [newMessage, setNewMessage] = useState('');
  const flatListRef = useRef<FlatList>(null);
  
  // Get other user info (not the current user)
  const otherUser = mockUsers['2']; // In real app, this would be dynamic based on chat
  const currentUserId = '1'; // In real app, this would come from auth store

  useEffect(() => {
    // Scroll to bottom when messages change
    if (flatListRef.current && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const sendMessage = () => {
    if (newMessage.trim() === '') return;

    const message = {
      id: Date.now().toString(),
      senderId: currentUserId,
      receiverId: '2',
      content: newMessage.trim(),
      timestamp: new Date(),
      isRead: false,
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // TODO: In Component 3, this will call the chat service
    // chatService.sendMessage(id, newMessage);
  };

  const renderMessage = ({ item }: { item: typeof mockMessages[0] }) => {
    const isOwn = item.senderId === currentUserId;
    return <MessageBubble message={item} isOwn={isOwn} />;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Image 
            source={{ uri: otherUser.photo }} 
            style={styles.headerAvatar}
            contentFit="cover"
          />
          <View style={styles.headerInfo}>
            <Text style={styles.headerName}>{otherUser.name}</Text>
            <Text style={styles.headerStatus}>Active now</Text>
          </View>
        </View>
        
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-vertical" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContainer}
        showsVerticalScrollIndicator={false}
      />

      {/* Input Area */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              placeholder="Type a message..."
              placeholderTextColor="#999"
              value={newMessage}
              onChangeText={setNewMessage}
              multiline
              maxLength={500}
            />
            <TouchableOpacity 
              style={[
                styles.sendButton,
                newMessage.trim() === '' && styles.sendButtonDisabled
              ]}
              onPress={sendMessage}
              disabled={newMessage.trim() === ''}
            >
              <Ionicons 
                name="send" 
                size={20} 
                color={newMessage.trim() === '' ? '#ccc' : '#FF4458'} 
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 0.5,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
    marginRight: 10,
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  headerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  headerStatus: {
    fontSize: 12,
    color: '#4CAF50',
    marginTop: 2,
  },
  moreButton: {
    padding: 8,
  },
  messagesList: {
    flex: 1,
  },
  messagesContainer: {
    padding: 16,
  },
  messageContainer: {
    marginBottom: 12,
  },
  ownMessageContainer: {
    alignItems: 'flex-end',
  },
  otherMessageContainer: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: width * 0.75,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  ownMessageBubble: {
    backgroundColor: '#FF4458',
    borderBottomRightRadius: 6,
  },
  otherMessageBubble: {
    backgroundColor: 'white',
    borderBottomLeftRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  ownMessageText: {
    color: 'white',
  },
  otherMessageText: {
    color: '#333',
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
  },
  ownMessageTime: {
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'right',
  },
  otherMessageTime: {
    color: '#999',
  },
  inputContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 0.5,
    borderTopColor: '#e0e0e0',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#f5f5f5',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendButton: {
    marginLeft: 10,
    padding: 8,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});