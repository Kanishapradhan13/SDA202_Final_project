import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Types
interface User {
  id: string;
  name: string;
  photo: string;
  age?: number;
}

interface Match {
  id: string;
  users: string[];
  createdAt: Date;
  lastActivity?: Date;
  isActive: boolean;
}

interface MatchWithUserInfo {
  id: string;
  user: User;
  createdAt: Date;
  lastActivity?: Date;
  isActive: boolean;
}

interface MatchState {
  // State
  matches: MatchWithUserInfo[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  loadMatches: () => Promise<void>;
  addMatch: (match: Match) => Promise<void>;
  removeMatch: (matchId: string) => Promise<void>;
  clearError: () => void;
}

// Mock user data for matches
const mockUsers: { [key: string]: User } = {
  '1': {
    id: '1',
    name: 'Sarah',
    photo: 'https://images.unsplash.com/photo-1494790108755-2616b612b515?w=400',
    age: 25,
  },
  '2': {
    id: '2',
    name: 'Emma',
    photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400',
    age: 23,
  },
  '3': {
    id: '3',
    name: 'Jessica',
    photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400',
    age: 28,
  },
  '4': {
    id: '4',
    name: 'Ashley',
    photo: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400',
    age: 26,
  },
  '5': {
    id: '5',
    name: 'Olivia',
    photo: 'https://images.unsplash.com/photo-1521577352947-9bb58764b69a?w=400',
    age: 24,
  },
};

// Match Store
export const useMatchStore = create<MatchState>((set, get) => ({
  // Initial state
  matches: [],
  isLoading: false,
  error: null,

  // Actions
  loadMatches: async () => {
    set({ isLoading: true, error: null });
    
    try {
      // Load matches from AsyncStorage
      const storedMatches = await AsyncStorage.getItem('matches');
      const matches: Match[] = storedMatches ? JSON.parse(storedMatches) : [];
      
      // Convert matches to include user info
      const matchesWithUserInfo: MatchWithUserInfo[] = matches
        .map(match => {
          // Get the other user (not the current user)
          const otherUserId = match.users.find(userId => userId !== '1');
          const user = otherUserId ? mockUsers[otherUserId] : null;
          
          if (!user) return null;
          
          return {
            id: match.id,
            user,
            createdAt: new Date(match.createdAt),
            lastActivity: match.lastActivity ? new Date(match.lastActivity) : undefined,
            isActive: match.isActive,
          };
        })
        .filter(Boolean) as MatchWithUserInfo[];
      
      // Sort by creation date (newest first)
      matchesWithUserInfo.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      
      set({ 
        matches: matchesWithUserInfo,
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: 'Failed to load matches', 
        isLoading: false 
      });
    }
  },

  addMatch: async (match: Match) => {
    try {
      // Get current matches from storage
      const storedMatches = await AsyncStorage.getItem('matches');
      const matches: Match[] = storedMatches ? JSON.parse(storedMatches) : [];
      
      // Add new match
      matches.push(match);
      await AsyncStorage.setItem('matches', JSON.stringify(matches));
      
      // Update state
      const otherUserId = match.users.find(userId => userId !== '1');
      const user = otherUserId ? mockUsers[otherUserId] : null;
      
      if (user) {
        const newMatchWithUserInfo: MatchWithUserInfo = {
          id: match.id,
          user,
          createdAt: new Date(match.createdAt),
          lastActivity: match.lastActivity ? new Date(match.lastActivity) : undefined,
          isActive: match.isActive,
        };
        
        set(state => ({
          matches: [newMatchWithUserInfo, ...state.matches]
        }));
      }
    } catch (error) {
      set({ error: 'Failed to add match' });
    }
  },

  removeMatch: async (matchId: string) => {
    try {
      // Remove from storage
      const storedMatches = await AsyncStorage.getItem('matches');
      const matches: Match[] = storedMatches ? JSON.parse(storedMatches) : [];
      const filteredMatches = matches.filter(match => match.id !== matchId);
      await AsyncStorage.setItem('matches', JSON.stringify(filteredMatches));
      
      // Update state
      set(state => ({
        matches: state.matches.filter(match => match.id !== matchId)
      }));
    } catch (error) {
      set({ error: 'Failed to remove match' });
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));