import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Types
interface Profile {
  id: string;
  name: string;
  age: number;
  photos: string[];
  bio?: string;
  distance: number;
  interests?: string[];
  job?: string;
  school?: string;
  isOnline?: boolean;
  lastActive?: Date;
}

type SwipeAction = 'like' | 'pass';

interface SwipeData {
  id: string;
  userId: string;
  targetUserId: string;
  action: SwipeAction;
  createdAt: Date;
}

interface Match {
  id: string;
  users: string[];
  createdAt: Date;
  lastActivity?: Date;
  isActive: boolean;
}

interface UserState {
  // State
  profiles: Profile[];
  currentProfileIndex: number;
  swipeHistory: SwipeData[];
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  
  // Actions
  loadProfiles: () => Promise<void>;
  swipeProfile: (profileId: string, action: SwipeAction) => Promise<Match | null>;
  resetProfiles: () => void;
  loadMoreProfiles: () => Promise<void>;
  clearError: () => void;
}

// Mock profiles data
const mockProfilesData: Profile[] = [
  {
    id: '1',
    name: 'Sarah',
    age: 25,
    photos: [
      'https://images.unsplash.com/photo-1494790108755-2616b612b515?w=400',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400'
    ],
    bio: 'Love hiking and good coffee ☕ Always exploring new trails!',
    distance: 2,
    interests: ['Hiking', 'Coffee', 'Photography'],
    job: 'Marketing Manager',
    school: 'UC Berkeley',
    isOnline: true,
  },
  {
    id: '2',
    name: 'Emma',
    age: 23,
    photos: [
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400',
      'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=400'
    ],
    bio: 'Artist and dog lover 🎨🐕 Looking for someone to share adventures with!',
    distance: 5,
    interests: ['Art', 'Dogs', 'Travel'],
    job: 'Graphic Designer',
    school: 'Art Institute',
    isOnline: false,
    lastActive: new Date(Date.now() - 3600000), // 1 hour ago
  },
  {
    id: '3',
    name: 'Jessica',
    age: 28,
    photos: [
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400',
      'https://images.unsplash.com/photo-1557053910-d9eadeed1c58?w=400'
    ],
    bio: 'Yoga instructor and traveler ✈️🧘‍♀️ Spreading positive vibes everywhere I go!',
    distance: 3,
    interests: ['Yoga', 'Travel', 'Meditation', 'Healthy Living'],
    job: 'Yoga Instructor',
    school: 'Stanford University',
    isOnline: true,
  },
  {
    id: '4',
    name: 'Ashley',
    age: 26,
    photos: [
      'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400'
    ],
    bio: 'Foodie and book lover 📚🍕 Always down for trying new restaurants!',
    distance: 7,
    interests: ['Reading', 'Food', 'Wine', 'Cooking'],
    job: 'Software Developer',
    school: 'MIT',
    isOnline: false,
  },
  {
    id: '5',
    name: 'Olivia',
    age: 24,
    photos: [
      'https://images.unsplash.com/photo-1521577352947-9bb58764b69a?w=400'
    ],
    bio: 'Musician and nature lover 🎵🌲 Let\'s make beautiful music together!',
    distance: 4,
    interests: ['Music', 'Nature', 'Guitar', 'Concerts'],
    job: 'Music Teacher',
    school: 'Berklee College of Music',
    isOnline: true,
  }
];

// User Store
export const useUserStore = create<UserState>((set, get) => ({
  // Initial state
  profiles: [],
  currentProfileIndex: 0,
  swipeHistory: [],
  isLoading: false,
  error: null,
  hasMore: true,

  // Actions
  loadProfiles: async () => {
    set({ isLoading: true, error: null });
    
    try {
      // TODO: In Component 3, this will call the actual user service
      // For now, simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Load swipe history to filter out already swiped profiles
      const storedSwipeHistory = await AsyncStorage.getItem('swipeHistory');
      const swipeHistory: SwipeData[] = storedSwipeHistory 
        ? JSON.parse(storedSwipeHistory) 
        : [];
      
      const swipedUserIds = new Set(swipeHistory.map(swipe => swipe.targetUserId));
      
      // Filter out already swiped profiles
      const availableProfiles = mockProfilesData.filter(
        profile => !swipedUserIds.has(profile.id)
      );
      
      set({ 
        profiles: availableProfiles,
        currentProfileIndex: 0,
        swipeHistory,
        isLoading: false,
        hasMore: availableProfiles.length > 0
      });
    } catch (error) {
      set({ 
        error: 'Failed to load profiles', 
        isLoading: false 
      });
    }
  },

  swipeProfile: async (profileId: string, action: SwipeAction) => {
    const state = get();
    const currentProfile = state.profiles[state.currentProfileIndex];
    
    if (!currentProfile || currentProfile.id !== profileId) {
      return null;
    }

    try {
      // Create swipe record
      const swipeData: SwipeData = {
        id: Date.now().toString(),
        userId: '1', // TODO: Get from auth store
        targetUserId: profileId,
        action,
        createdAt: new Date(),
      };

      // Update swipe history
      const newSwipeHistory = [...state.swipeHistory, swipeData];
      
      // Store swipe history
      await AsyncStorage.setItem('swipeHistory', JSON.stringify(newSwipeHistory));

      // Move to next profile
      const nextIndex = state.currentProfileIndex + 1;
      
      set({
        currentProfileIndex: nextIndex,
        swipeHistory: newSwipeHistory,
        hasMore: nextIndex < state.profiles.length
      });

      // Check for match (simulate match logic)
      let match: Match | null = null;
      if (action === 'like') {
        // Simulate 30% chance of match
        const isMatch = Math.random() < 0.3;
        
        if (isMatch) {
          match = {
            id: Date.now().toString(),
            users: ['1', profileId], // Current user ID and target user ID
            createdAt: new Date(),
            isActive: true,
          };

          // Store match
          const storedMatches = await AsyncStorage.getItem('matches');
          const matches = storedMatches ? JSON.parse(storedMatches) : [];
          matches.push(match);
          await AsyncStorage.setItem('matches', JSON.stringify(matches));
        }
      }

      // TODO: In Component 3, this will call the swipe service
      console.log(`Swiped ${action} on ${currentProfile.name}`, { match });
      
      return match;
    } catch (error) {
      set({ error: 'Failed to record swipe' });
      return null;
    }
  },

  resetProfiles: () => {
    set({
      currentProfileIndex: 0,
      hasMore: true,
      error: null
    });
  },

  loadMoreProfiles: async () => {
    const state = get();
    if (state.isLoading || !state.hasMore) return;

    set({ isLoading: true });
    
    try {
      // TODO: In Component 3, implement pagination
      // For now, just simulate loading more profiles
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // In a real app, this would fetch more profiles from the server
      console.log('Loading more profiles...');
      
      set({ 
        isLoading: false,
        hasMore: false // For now, no more profiles
      });
    } catch (error) {
      set({ 
        error: 'Failed to load more profiles', 
        isLoading: false 
      });
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));