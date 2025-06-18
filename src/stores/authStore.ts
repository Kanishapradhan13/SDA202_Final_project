import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Types
interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  age: number;
  photos: string[];
  bio?: string;
  interests: string[];
  job?: string;
  school?: string;
  location: string;
  lookingFor?: string;
  isVerified?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  age: number;
}

interface AuthState {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  loadStoredAuth: () => Promise<void>;
  clearError: () => void;
  updateUser: (userData: Partial<User>) => void;
}

// Auth Store
export const useAuthStore = create<AuthState>((set, get) => ({
  // Initial state
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  // Actions
  login: async (credentials: LoginCredentials) => {
    set({ isLoading: true, error: null });
    
    try {
      // TODO: In Component 3, this will call the actual auth service
      // For now, simulate API call with mock data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock user data
      const mockUser: User = {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: credentials.email,
        age: 28,
        photos: [
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
          'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
        ],
        bio: 'Love hiking, good coffee, and meeting new people. Always up for an adventure! 🏔️☕',
        interests: ['Hiking', 'Photography', 'Coffee', 'Travel', 'Music', 'Cooking'],
        job: 'Software Engineer',
        school: 'University of Technology',
        location: 'San Francisco, CA',
        lookingFor: 'Long-term relationship',
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Store in AsyncStorage
      await AsyncStorage.setItem('user', JSON.stringify(mockUser));
      await AsyncStorage.setItem('isAuthenticated', 'true');

      set({ 
        user: mockUser, 
        isAuthenticated: true, 
        isLoading: false,
        error: null 
      });
    } catch (error) {
      set({ 
        error: 'Invalid credentials', 
        isLoading: false,
        user: null,
        isAuthenticated: false
      });
      throw error;
    }
  },

  register: async (data: RegisterData) => {
    set({ isLoading: true, error: null });
    
    try {
      // TODO: In Component 3, this will call the actual auth service
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock successful registration
      const newUser: User = {
        id: Date.now().toString(),
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        age: data.age,
        photos: [],
        bio: '',
        interests: [],
        location: 'San Francisco, CA', // Default location
        isVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Store in AsyncStorage
      await AsyncStorage.setItem('user', JSON.stringify(newUser));
      await AsyncStorage.setItem('isAuthenticated', 'true');

      set({ 
        user: newUser, 
        isAuthenticated: true, 
        isLoading: false,
        error: null 
      });
    } catch (error) {
      set({ 
        error: 'Registration failed', 
        isLoading: false 
      });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    
    try {
      // Clear AsyncStorage
      await AsyncStorage.multiRemove(['user', 'isAuthenticated']);
      
      set({ 
        user: null, 
        isAuthenticated: false, 
        isLoading: false,
        error: null 
      });
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout even if storage clear fails
      set({ 
        user: null, 
        isAuthenticated: false, 
        isLoading: false,
        error: null 
      });
    }
  },

  loadStoredAuth: async () => {
    set({ isLoading: true });
    
    try {
      const [storedUser, isAuthenticatedStored] = await AsyncStorage.multiGet([
        'user',
        'isAuthenticated'
      ]);

      if (isAuthenticatedStored[1] === 'true' && storedUser[1]) {
        const user = JSON.parse(storedUser[1]);
        set({ 
          user, 
          isAuthenticated: true, 
          isLoading: false 
        });
      } else {
        set({ 
          user: null, 
          isAuthenticated: false, 
          isLoading: false 
        });
      }
    } catch (error) {
      console.error('Load stored auth error:', error);
      set({ 
        user: null, 
        isAuthenticated: false, 
        isLoading: false,
        error: 'Failed to load stored authentication'
      });
    }
  },

  clearError: () => {
    set({ error: null });
  },

  updateUser: (userData: Partial<User>) => {
    const currentUser = get().user;
    if (!currentUser) return;

    const updatedUser = {
      ...currentUser,
      ...userData,
      updatedAt: new Date(),
    };

    // Update AsyncStorage
    AsyncStorage.setItem('user', JSON.stringify(updatedUser)).catch(error => {
      console.error('Failed to update user in storage:', error);
    });

    set({ user: updatedUser });
  },
}));