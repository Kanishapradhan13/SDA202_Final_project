import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Types
interface User {
  id: string;
  name: string;
  photo: string;
}

interface Message {
  id: string;
  chatId: string;
  senderId: string;
  receiverId: string;
  content: string;
  type: 'text' | 'image';
  isRead: boolean;
  createdAt: Date;
}

interface Chat {
  id: string;
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
  createdAt: Date;
  updatedAt: Date;
}

interface ChatState {
  // State
  chats: Chat[];
  messages: { [chatId: string]: Message[] };
  isLoading: boolean;
  error: string | null;
  
  // Actions
  loadChats: () => Promise<void>;
  loadMessages: (chatId: string) => Promise<void>;
  sendMessage: (chatId: string, content: string) => Promise<void>;
  markAsRead: (chatId: string) => Promise<void>;
  clearError: () => void;
}

// Mock users data
const mockUsers: { [key: string]: User } = {
  '1': { id: '1', name: 'You', photo: '' },
  '2': { id: '2', name: 'Sarah', photo: 'https://images.unsplash.com/photo-1494790108755-2616b612b515?w=400' },
  '3': { id: '3', name: 'Emma', photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400' },
  '4': { id: '4', name: 'Jessica', photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400' },
  '5': { id: '5', name: 'Ashley', photo: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400' },
};

// Mock initial chats data
const mockChatsData: Chat[] = [
  {
    id: '1',
    participants: [mockUsers['1'], mockUsers['2']],
    lastMessage: {
      id: '1',
      chatId: '1',
      senderId: '2',
      receiverId: '1',
      content: 'Hey! How are you doing?',
      type: 'text',
      isRead: false,
      createdAt: new Date(Date.now() - 300000), // 5 minutes ago
    },
    unreadCount: 2,
    createdAt: new Date(Date.now() - 86400000), // 1 day ago
    updatedAt: new Date(Date.now() - 300000),
  },
  {
    id: '2',
    participants: [mockUsers['1'], mockUsers['3']],
    lastMessage: {
      id: '2',
      chatId: '2',
      senderId: '1',
      receiverId: '3',
      content: 'That sounds amazing! Let\'s do it',
      type: 'text',
      isRead: true,
      createdAt: new Date(Date.now() - 3600000), // 1 hour ago
    },
    unreadCount: 0,
    createdAt: new Date(Date.now() - 172800000), // 2 days ago
    updatedAt: new Date(Date.now() - 3600000),
  },
];

// Mock messages data
const mockMessagesData: { [chatId: string]: Message[] } = {
  '1': [
    {
      id: '1',
      chatId: '1',
      senderId: '2',
      receiverId: '1',
      content: 'Hey! How are you doing?',
      type: 'text',
      isRead: true,
      createdAt: new Date(Date.now() - 3600000),
    },
    {
      id: '2',
      chatId: '1',
      senderId: '1',
      receiverId: '2',
      content: 'Hi! I\'m doing great, thanks for asking. How about you?',
      type: 'text',
      isRead: true,
      createdAt: new Date(Date.now() - 3000000),
    },
    {
      id: '3',
      chatId: '1',
      senderId: '2',
      receiverId: '1',
      content: 'That\'s awesome! I\'m having a great day too. I saw your profile and loved your hiking photos!',
      type: 'text',
      isRead: true,
      createdAt: new Date(Date.now() - 2400000),
    },
    {
      id: '4',
      chatId: '1',
      senderId: '1',
      receiverId: '2',
      content: 'Thank you! I love hiking. Do you enjoy outdoor activities too?',
      type: 'text',
      isRead: true,
      createdAt: new Date(Date.now() - 1800000),
    },
    {
      id: '5',
      chatId: '1',
      senderId: '2',
      receiverId: '1',
      content: 'Absolutely! I go hiking almost every weekend. Maybe we could go together sometime? 🏔️',
      type: 'text',
      isRead: false,
      createdAt: new Date(Date.now() - 300000),
    },
  ],
  '2': [
    {
      id: '6',
      chatId: '2',
      senderId: '3',
      receiverId: '1',
      content: 'Nice to meet you!',
      type: 'text',
      isRead: true,
      createdAt: new Date(Date.now() - 7200000), // 2 hours ago
    },
    {
      id: '7',
      chatId: '2',
      senderId: '1',
      receiverId: '3',
      content: 'Nice to meet you too! I love your art portfolio',
      type: 'text',
      isRead: true,
      createdAt: new Date(Date.now() - 5400000),
    },
    {
      id: '8',
      chatId: '2',
      senderId: '1',
      receiverId: '3',
      content: 'That sounds amazing! Let\'s do it',
      type: 'text',
      isRead: true,
      createdAt: new Date(Date.now() - 3600000),
    },
  ],
};

// Chat Store
export const useChatStore = create<ChatState>((set, get) => ({
  // Initial state
  chats: [],
  messages: {},
  isLoading: false,
  error: null,

  // Actions
  loadChats: async () => {
    set({ isLoading: true, error: null });
    
    try {
      // TODO: In Component 3, this will call the actual chat service
      // For now, simulate API call and use mock data
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Try to load chats from AsyncStorage
      const storedChats = await AsyncStorage.getItem('chats');
      let chats = storedChats ? JSON.parse(storedChats) : mockChatsData;
      
      // Ensure dates are properly parsed
      chats = chats.map((chat: any) => ({
        ...chat,
        createdAt: new Date(chat.createdAt),
        updatedAt: new Date(chat.updatedAt),
        lastMessage: chat.lastMessage ? {
          ...chat.lastMessage,
          createdAt: new Date(chat.lastMessage.createdAt)
        } : undefined
      }));
      
      // Sort by last activity (most recent first)
      chats.sort((a: Chat, b: Chat) => b.updatedAt.getTime() - a.updatedAt.getTime());
      
      // Store initial data if not exists
      if (!storedChats) {
        await AsyncStorage.setItem('chats', JSON.stringify(chats));
      }
      
      set({ 
        chats,
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: 'Failed to load chats', 
        isLoading: false 
      });
    }
  },

  loadMessages: async (chatId: string) => {
    const state = get();
    
    // Don't reload if messages already exist
    if (state.messages[chatId]) {
      return;
    }
    
    set({ isLoading: true, error: null });
    
    try {
      // TODO: In Component 3, this will call the actual chat service
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Try to load messages from AsyncStorage
      const storedMessages = await AsyncStorage.getItem(`messages_${chatId}`);
      let messages = storedMessages ? JSON.parse(storedMessages) : mockMessagesData[chatId] || [];
      
      // Ensure dates are properly parsed
      messages = messages.map((message: any) => ({
        ...message,
        createdAt: new Date(message.createdAt)
      }));
      
      // Sort by creation time (oldest first)
      messages.sort((a: Message, b: Message) => a.createdAt.getTime() - b.createdAt.getTime());
      
      // Store initial data if not exists
      if (!storedMessages && messages.length > 0) {
        await AsyncStorage.setItem(`messages_${chatId}`, JSON.stringify(messages));
      }
      
      set(state => ({
        messages: {
          ...state.messages,
          [chatId]: messages
        },
        isLoading: false
      }));
    } catch (error) {
      set({ 
        error: 'Failed to load messages', 
        isLoading: false 
      });
    }
  },

  sendMessage: async (chatId: string, content: string) => {
    const state = get();
    const chat = state.chats.find(c => c.id === chatId);
    
    if (!chat) {
      set({ error: 'Chat not found' });
      return;
    }
    
    try {
      // Create new message
      const newMessage: Message = {
        id: Date.now().toString(),
        chatId,
        senderId: '1', // Current user ID
        receiverId: chat.participants.find(p => p.id !== '1')?.id || '',
        content,
        type: 'text',
        isRead: false,
        createdAt: new Date(),
      };
      
      // Update messages in state
      const currentMessages = state.messages[chatId] || [];
      const updatedMessages = [...currentMessages, newMessage];
      
      // Update chat's last message and timestamp
      const updatedChats = state.chats.map(c => {
        if (c.id === chatId) {
          return {
            ...c,
            lastMessage: newMessage,
            updatedAt: new Date(),
          };
        }
        return c;
      });
      
      // Sort chats by last activity
      updatedChats.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
      
      set({
        messages: {
          ...state.messages,
          [chatId]: updatedMessages
        },
        chats: updatedChats
      });
      
      // Store in AsyncStorage
      await AsyncStorage.setItem(`messages_${chatId}`, JSON.stringify(updatedMessages));
      await AsyncStorage.setItem('chats', JSON.stringify(updatedChats));
      
      // TODO: In Component 3, this will call the actual chat service
      console.log('Message sent:', newMessage);
      
    } catch (error) {
      set({ error: 'Failed to send message' });
    }
  },

  markAsRead: async (chatId: string) => {
    const state = get();
    
    try {
      // Mark all messages in chat as read
      const messages = state.messages[chatId] || [];
      const updatedMessages = messages.map(message => ({
        ...message,
        isRead: true
      }));
      
      // Update chat's unread count
      const updatedChats = state.chats.map(chat => {
        if (chat.id === chatId) {
          return {
            ...chat,
            unreadCount: 0
          };
        }
        return chat;
      });
      
      set({
        messages: {
          ...state.messages,
          [chatId]: updatedMessages
        },
        chats: updatedChats
      });
      
      // Store in AsyncStorage
      await AsyncStorage.setItem(`messages_${chatId}`, JSON.stringify(updatedMessages));
      await AsyncStorage.setItem('chats', JSON.stringify(updatedChats));
      
    } catch (error) {
      set({ error: 'Failed to mark messages as read' });
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));