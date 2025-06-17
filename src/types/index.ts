// User and Profile Types
export interface User {
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
  
  export interface Profile {
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
  
  // Authentication Types
  export interface LoginCredentials {
    email: string;
    password: string;
  }
  
  export interface RegisterData {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    age: number;
  }
  
  export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
  }
  
  // Swipe and Matching Types
  export type SwipeAction = 'like' | 'pass';
  
  export interface SwipeData {
    id: string;
    userId: string;
    targetUserId: string;
    action: SwipeAction;
    createdAt: Date;
  }
  
  export interface Match {
    id: string;
    users: string[];
    createdAt: Date;
    lastActivity?: Date;
    isActive: boolean;
  }
  
  // Chat and Message Types
  export interface Message {
    id: string;
    matchId: string;
    senderId: string;
    receiverId: string;
    content: string;
    type: 'text' | 'image' | 'gif';
    isRead: boolean;
    createdAt: Date;
  }
  
  export interface Chat {
    id: string;
    matchId: string;
    participants: User[];
    lastMessage?: Message;
    unreadCount: number;
    createdAt: Date;
    updatedAt: Date;
  }
  
  // Location Types
  export interface Location {
    latitude: number;
    longitude: number;
    city?: string;
    state?: string;
    country?: string;
  }
  
  // Preferences Types
  export interface UserPreferences {
    ageRange: {
      min: number;
      max: number;
    };
    maxDistance: number;
    interestedIn: 'men' | 'women' | 'both';
    showMe: 'men' | 'women' | 'both';
  }
  
  // API Response Types
  export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
  }
  
  export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
  }
  
  // Store State Types
  export interface UserStore {
    profiles: Profile[];
    currentProfile: Profile | null;
    isLoading: boolean;
    error: string | null;
    hasMore: boolean;
    
    // Actions
    loadProfiles: () => Promise<void>;
    swipeProfile: (profileId: string, action: SwipeAction) => Promise<Match | null>;
    resetProfiles: () => void;
    setCurrentProfile: (profile: Profile | null) => void;
  }
  
  export interface MatchStore {
    matches: Match[];
    isLoading: boolean;
    error: string | null;
    
    // Actions
    loadMatches: () => Promise<void>;
    addMatch: (match: Match) => void;
    removeMatch: (matchId: string) => void;
  }
  
  export interface ChatStore {
    chats: Chat[];
    messages: { [chatId: string]: Message[] };
    isLoading: boolean;
    error: string | null;
    
    // Actions
    loadChats: () => Promise<void>;
    loadMessages: (chatId: string) => Promise<void>;
    sendMessage: (chatId: string, content: string) => Promise<void>;
    markAsRead: (chatId: string) => Promise<void>;
  }
  
  // Navigation Types
  export type RootStackParamList = {
    '(auth)': undefined;
    '(tabs)': undefined;
    'chat/[id]': { id: string };
  };
  
  export type AuthStackParamList = {
    login: undefined;
    register: undefined;
    'forgot-password': undefined;
  };
  
  export type TabsParamList = {
    discover: undefined;
    matches: undefined;
    chat: undefined;
    profile: undefined;
  };
  
  // Form Types
  export interface FormField {
    value: string;
    error: string | null;
    isValid: boolean;
  }
  
  export interface LoginForm {
    email: FormField;
    password: FormField;
  }
  
  export interface RegisterForm {
    firstName: FormField;
    lastName: FormField;
    email: FormField;
    password: FormField;
    confirmPassword: FormField;
    age: FormField;
  }
  
  // Error Types
  export interface AppError {
    code: string;
    message: string;
    details?: any;
  }
  
  // Constants
  export const SWIPE_THRESHOLD = 0.3;
  export const MAX_DISTANCE = 100;
  export const MIN_AGE = 18;
  export const MAX_AGE = 99;
  export const MAX_PHOTOS = 6;
  
  // Utility Types
  export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
  export type Partial<T> = { [P in keyof T]?: T[P] };
  export type Required<T> = { [P in keyof T]-?: T[P] };