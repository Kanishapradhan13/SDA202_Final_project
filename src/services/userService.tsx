import {
    collection,
    doc,
    getDocs,
    getDoc,
    setDoc,
    updateDoc,
    query,
    where,
    orderBy,
    limit,
    startAfter,
    DocumentSnapshot,
  } from 'firebase/firestore';
  import { auth, db } from '../config/firebase';
  
  // Types
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
    location?: string;
  }
  
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
  
  export class UserService {
    /**
     * Get profiles for discovery (excluding already swiped profiles)
     */
    static async getProfiles(lastProfile?: DocumentSnapshot, limitCount: number = 10): Promise<{
      profiles: Profile[];
      lastDoc?: DocumentSnapshot;
      hasMore: boolean;
    }> {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          throw new Error('User not authenticated');
        }
  
        // Get user's swipe history to exclude already swiped profiles
        const swipedUserIds = await this.getSwipedUserIds(currentUser.uid);
        
        // Create base query for profiles
        let profileQuery = query(
          collection(db, 'profiles'),
          where('isVisible', '==', true),
          orderBy('lastActive', 'desc'),
          limit(limitCount + swipedUserIds.size) // Get extra to account for filtering
        );
  
        // Add pagination if lastProfile provided
        if (lastProfile) {
          profileQuery = query(
            collection(db, 'profiles'),
            where('isVisible', '==', true),
            orderBy('lastActive', 'desc'),
            startAfter(lastProfile),
            limit(limitCount + swipedUserIds.size)
          );
        }
  
        const snapshot = await getDocs(profileQuery);
        const allProfiles: Profile[] = [];
        let lastDoc: DocumentSnapshot | undefined;
  
        snapshot.forEach((doc) => {
          // Exclude current user and already swiped profiles
          if (doc.id !== currentUser.uid && !swipedUserIds.has(doc.id)) {
            const data = doc.data();
            allProfiles.push({
              id: doc.id,
              name: data.name,
              age: data.age,
              photos: data.photos || [],
              bio: data.bio || '',
              distance: this.calculateDistance(data.location),
              interests: data.interests || [],
              job: data.job || '',
              school: data.school || '',
              isOnline: data.isOnline || false,
              lastActive: data.lastActive ? new Date(data.lastActive) : undefined,
              location: data.location,
            });
          }
          lastDoc = doc;
        });
  
        // Limit to requested count
        const profiles = allProfiles.slice(0, limitCount);
        const hasMore = allProfiles.length === limitCount && snapshot.size > 0;
  
        return {
          profiles,
          lastDoc,
          hasMore,
        };
      } catch (error) {
        console.error('Get profiles error:', error);
        throw new Error('Failed to load profiles. Please try again.');
      }
    }
  
    /**
     * Record a swipe action and check for matches
     */
    static async swipeProfile(targetUserId: string, action: SwipeAction): Promise<Match | null> {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          throw new Error('User not authenticated');
        }
  
        // Create swipe record
        const swipeId = `${currentUser.uid}_${targetUserId}`;
        const swipeData: Omit<SwipeData, 'id'> = {
          userId: currentUser.uid,
          targetUserId,
          action,
          createdAt: new Date(),
        };
  
        // Store swipe in Firestore
        await setDoc(doc(db, 'swipes', swipeId), {
          ...swipeData,
          createdAt: swipeData.createdAt.toISOString(),
        });
  
        // Check for match only if current user liked the target
        if (action === 'like') {
          const match = await this.checkForMatch(currentUser.uid, targetUserId);
          return match;
        }
  
        return null;
      } catch (error) {
        console.error('Swipe profile error:', error);
        throw new Error('Failed to record swipe. Please try again.');
      }
    }
  
    /**
     * Check if there's a mutual like (match)
     */
    private static async checkForMatch(userId: string, targetUserId: string): Promise<Match | null> {
      try {
        // Check if target user has liked current user
        const reverseSwipeId = `${targetUserId}_${userId}`;
        const reverseSwipeDoc = await getDoc(doc(db, 'swipes', reverseSwipeId));
  
        if (reverseSwipeDoc.exists() && reverseSwipeDoc.data().action === 'like') {
          // It's a match! Create match document
          const matchId = this.generateMatchId(userId, targetUserId);
          const matchData: Omit<Match, 'id'> = {
            users: [userId, targetUserId].sort(), // Sort for consistency
            createdAt: new Date(),
            isActive: true,
          };
  
          await setDoc(doc(db, 'matches', matchId), {
            ...matchData,
            createdAt: matchData.createdAt.toISOString(),
          });
  
          return {
            id: matchId,
            ...matchData,
          };
        }
  
        return null;
      } catch (error) {
        console.error('Check for match error:', error);
        return null;
      }
    }
  
    /**
     * Get user's swipe history
     */
    private static async getSwipedUserIds(userId: string): Promise<Set<string>> {
      try {
        const swipesQuery = query(
          collection(db, 'swipes'),
          where('userId', '==', userId)
        );
  
        const snapshot = await getDocs(swipesQuery);
        const swipedUserIds = new Set<string>();
  
        snapshot.forEach((doc) => {
          const data = doc.data();
          swipedUserIds.add(data.targetUserId);
        });
  
        return swipedUserIds;
      } catch (error) {
        console.error('Get swiped user IDs error:', error);
        return new Set();
      }
    }
  
    /**
     * Generate consistent match ID for two users
     */
    private static generateMatchId(userId1: string, userId2: string): string {
      const sortedIds = [userId1, userId2].sort();
      return `${sortedIds[0]}_${sortedIds[1]}`;
    }
  
    /**
     * Calculate distance between user and profile (placeholder implementation)
     */
    private static calculateDistance(profileLocation?: string): number {
      // TODO: Implement real distance calculation using user's location and profile location
      // For now, return random distance between 1-20 km
      return Math.floor(Math.random() * 20) + 1;
    }
  
    /**
     * Update user's profile
     */
    static async updateProfile(userId: string, profileData: Partial<Profile>): Promise<void> {
      try {
        const updateData = {
          ...profileData,
          updatedAt: new Date().toISOString(),
        };
  
        // Remove undefined values
        Object.keys(updateData).forEach(key => {
          if (updateData[key as keyof typeof updateData] === undefined) {
            delete updateData[key as keyof typeof updateData];
          }
        });
  
        await updateDoc(doc(db, 'profiles', userId), updateData);
      } catch (error) {
        console.error('Update profile error:', error);
        throw new Error('Failed to update profile. Please try again.');
      }
    }
  
    /**
     * Get user's profile by ID
     */
    static async getProfile(userId: string): Promise<Profile | null> {
      try {
        const profileDoc = await getDoc(doc(db, 'profiles', userId));
        
        if (!profileDoc.exists()) {
          return null;
        }
  
        const data = profileDoc.data();
        return {
          id: profileDoc.id,
          name: data.name,
          age: data.age,
          photos: data.photos || [],
          bio: data.bio || '',
          distance: 0,
          interests: data.interests || [],
          job: data.job || '',
          school: data.school || '',
          isOnline: data.isOnline || false,
          lastActive: data.lastActive ? new Date(data.lastActive) : undefined,
          location: data.location,
        };
      } catch (error) {
        console.error('Get profile error:', error);
        return null;
      }
    }
  
    /**
     * Seed database with sample profiles (for development)
     */
    static async seedProfiles(): Promise<void> {
      try {
        const sampleProfiles = [
          {
            id: 'sample_sarah',
            name: 'Sarah Johnson',
            age: 25,
            photos: [
              'https://images.unsplash.com/photo-1494790108755-2616b612b515?w=400',
              'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400'
            ],
            bio: 'Love hiking and good coffee ☕ Always exploring new trails!',
            interests: ['Hiking', 'Coffee', 'Photography'],
            job: 'Marketing Manager',
            school: 'UC Berkeley',
            location: 'San Francisco, CA',
            isOnline: true,
            lastActive: new Date().toISOString(),
            isVisible: true,
          },
          {
            id: 'sample_emma',
            name: 'Emma Wilson',
            age: 23,
            photos: [
              'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400',
              'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=400'
            ],
            bio: 'Artist and dog lover 🎨🐕 Looking for someone to share adventures with!',
            interests: ['Art', 'Dogs', 'Travel'],
            job: 'Graphic Designer',
            school: 'Art Institute',
            location: 'San Francisco, CA',
            isOnline: false,
            lastActive: new Date(Date.now() - 3600000).toISOString(),
            isVisible: true,
          },
          {
            id: 'sample_jessica',
            name: 'Jessica Chen',
            age: 28,
            photos: [
              'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400',
              'https://images.unsplash.com/photo-1557053910-d9eadeed1c58?w=400'
            ],
            bio: 'Yoga instructor and traveler ✈️🧘‍♀️ Spreading positive vibes everywhere I go!',
            interests: ['Yoga', 'Travel', 'Meditation', 'Healthy Living'],
            job: 'Yoga Instructor',
            school: 'Stanford University',
            location: 'San Francisco, CA',
            isOnline: true,
            lastActive: new Date().toISOString(),
            isVisible: true,
          },
          {
            id: 'sample_ashley',
            name: 'Ashley Brown',
            age: 26,
            photos: [
              'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400'
            ],
            bio: 'Foodie and book lover 📚🍕 Always down for trying new restaurants!',
            interests: ['Reading', 'Food', 'Wine', 'Cooking'],
            job: 'Software Developer',
            school: 'MIT',
            location: 'San Francisco, CA',
            isOnline: false,
            lastActive: new Date(Date.now() - 7200000).toISOString(),
            isVisible: true,
          },
          {
            id: 'sample_olivia',
            name: 'Olivia Garcia',
            age: 24,
            photos: [
              'https://images.unsplash.com/photo-1521577352947-9bb58764b69a?w=400'
            ],
            bio: 'Musician and nature lover 🎵🌲 Let\'s make beautiful music together!',
            interests: ['Music', 'Nature', 'Guitar', 'Concerts'],
            job: 'Music Teacher',
            school: 'Berklee College of Music',
            location: 'San Francisco, CA',
            isOnline: true,
            lastActive: new Date().toISOString(),
            isVisible: true,
          },
        ];
  
        // Add each profile to Firestore
        for (const profile of sampleProfiles) {
          await setDoc(doc(db, 'profiles', profile.id), profile);
          console.log(`Added sample profile: ${profile.name}`);
        }
  
        console.log('Sample profiles seeded successfully!');
      } catch (error) {
        console.error('Seed profiles error:', error);
        throw new Error('Failed to seed sample profiles.');
      }
    }
  
    /**
     * Get user's matches
     */
    static async getMatches(userId: string): Promise<Match[]> {
      try {
        const matchesQuery = query(
          collection(db, 'matches'),
          where('users', 'array-contains', userId),
          where('isActive', '==', true),
          orderBy('createdAt', 'desc')
        );
  
        const snapshot = await getDocs(matchesQuery);
        const matches: Match[] = [];
  
        snapshot.forEach((doc) => {
          const data = doc.data();
          matches.push({
            id: doc.id,
            users: data.users,
            createdAt: new Date(data.createdAt),
            lastActivity: data.lastActivity ? new Date(data.lastActivity) : undefined,
            isActive: data.isActive,
          });
        });
  
        return matches;
      } catch (error) {
        console.error('Get matches error:', error);
        throw new Error('Failed to load matches. Please try again.');
      }
    }
  }