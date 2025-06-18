import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail,
    updateProfile,
    User as FirebaseUser,
  } from 'firebase/auth';
  import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
  import { auth, db } from '../config/firebase';
  
  // Types
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
  
  export class AuthService {
    /**
     * Register a new user with email and password
     */
    static async register(data: RegisterData): Promise<User> {
      try {
        // Create Firebase user
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          data.email,
          data.password
        );
  
        const firebaseUser = userCredential.user;
  
        // Update Firebase user profile
        await updateProfile(firebaseUser, {
          displayName: `${data.firstName} ${data.lastName}`,
        });
  
        // Create user document in Firestore
        const userData: User = {
          id: firebaseUser.uid,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          age: data.age,
          photos: [],
          bio: '',
          interests: [],
          job: '',
          school: '',
          location: 'San Francisco, CA', // Default location
          lookingFor: '',
          isVerified: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
  
        // Store user data in Firestore
        await setDoc(doc(db, 'users', firebaseUser.uid), {
          ...userData,
          createdAt: userData.createdAt.toISOString(),
          updatedAt: userData.updatedAt.toISOString(),
        });
  
        // Create public profile document
        await setDoc(doc(db, 'profiles', firebaseUser.uid), {
          name: `${data.firstName} ${data.lastName}`,
          age: data.age,
          photos: [],
          bio: '',
          interests: [],
          job: '',
          school: '',
          location: 'San Francisco, CA',
          isOnline: true,
          lastActive: new Date().toISOString(),
          isVisible: true,
        });
  
        return userData;
      } catch (error: any) {
        console.error('Registration error:', error);
        throw new Error(this.getErrorMessage(error.code));
      }
    }
  
    /**
     * Login user with email and password
     */
    static async login(credentials: LoginCredentials): Promise<User> {
      try {
        // Sign in with Firebase
        const userCredential = await signInWithEmailAndPassword(
          auth,
          credentials.email,
          credentials.password
        );
  
        const firebaseUser = userCredential.user;
  
        // Get user data from Firestore
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        
        if (!userDoc.exists()) {
          throw new Error('User data not found. Please contact support.');
        }
  
        const userData = userDoc.data();
        
        // Update last active time
        await updateDoc(doc(db, 'profiles', firebaseUser.uid), {
          isOnline: true,
          lastActive: new Date().toISOString(),
        });
  
        // Convert Firestore data to User type
        const user: User = {
          ...userData,
          id: firebaseUser.uid,
          createdAt: new Date(userData.createdAt),
          updatedAt: new Date(userData.updatedAt),
        } as User;
  
        return user;
      } catch (error: any) {
        console.error('Login error:', error);
        throw new Error(this.getErrorMessage(error.code));
      }
    }
  
    /**
     * Logout current user
     */
    static async logout(): Promise<void> {
      try {
        const currentUser = auth.currentUser;
        
        if (currentUser) {
          // Update online status
          await updateDoc(doc(db, 'profiles', currentUser.uid), {
            isOnline: false,
            lastActive: new Date().toISOString(),
          });
        }
  
        await signOut(auth);
      } catch (error: any) {
        console.error('Logout error:', error);
        throw new Error('Failed to logout. Please try again.');
      }
    }
  
    /**
     * Send password reset email
     */
    static async resetPassword(email: string): Promise<void> {
      try {
        await sendPasswordResetEmail(auth, email);
      } catch (error: any) {
        console.error('Password reset error:', error);
        throw new Error(this.getErrorMessage(error.code));
      }
    }
  
    /**
     * Get current user data from Firestore
     */
    static async getCurrentUser(): Promise<User | null> {
      try {
        const firebaseUser = auth.currentUser;
        
        if (!firebaseUser) {
          return null;
        }
  
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        
        if (!userDoc.exists()) {
          return null;
        }
  
        const userData = userDoc.data();
        
        return {
          ...userData,
          id: firebaseUser.uid,
          createdAt: new Date(userData.createdAt),
          updatedAt: new Date(userData.updatedAt),
        } as User;
      } catch (error) {
        console.error('Get current user error:', error);
        return null;
      }
    }
  
    /**
     * Update user profile data
     */
    static async updateUser(userId: string, data: Partial<User>): Promise<void> {
      try {
        const updateData = {
          ...data,
          updatedAt: new Date().toISOString(),
        };
  
        // Remove undefined values
        Object.keys(updateData).forEach(key => {
          if (updateData[key as keyof typeof updateData] === undefined) {
            delete updateData[key as keyof typeof updateData];
          }
        });
  
        // Update user document
        await updateDoc(doc(db, 'users', userId), updateData);
  
        // Update public profile if relevant fields changed
        const profileFields = ['firstName', 'lastName', 'age', 'photos', 'bio', 'interests', 'job', 'school', 'location'];
        const profileUpdateData: any = {};
        
        if (data.firstName || data.lastName) {
          profileUpdateData.name = `${data.firstName || ''} ${data.lastName || ''}`.trim();
        }
        
        profileFields.forEach(field => {
          if (data[field as keyof User] !== undefined) {
            if (field === 'firstName' || field === 'lastName') {
              // Already handled above
              return;
            }
            profileUpdateData[field] = data[field as keyof User];
          }
        });
  
        if (Object.keys(profileUpdateData).length > 0) {
          await updateDoc(doc(db, 'profiles', userId), profileUpdateData);
        }
      } catch (error) {
        console.error('Update user error:', error);
        throw new Error('Failed to update profile. Please try again.');
      }
    }
  
    /**
     * Get user-friendly error messages
     */
    private static getErrorMessage(errorCode: string): string {
      switch (errorCode) {
        case 'auth/user-not-found':
          return 'No account found with this email address.';
        case 'auth/wrong-password':
          return 'Incorrect password. Please try again.';
        case 'auth/email-already-in-use':
          return 'An account with this email already exists.';
        case 'auth/weak-password':
          return 'Password should be at least 6 characters long.';
        case 'auth/invalid-email':
          return 'Please enter a valid email address.';
        case 'auth/user-disabled':
          return 'This account has been disabled. Please contact support.';
        case 'auth/too-many-requests':
          return 'Too many failed attempts. Please try again later.';
        case 'auth/network-request-failed':
          return 'Network error. Please check your connection and try again.';
        default:
          return 'An unexpected error occurred. Please try again.';
      }
    }
  
    /**
     * Check if user is authenticated
     */
    static isAuthenticated(): boolean {
      return !!auth.currentUser;
    }
  
    /**
     * Get current Firebase user
     */
    static getCurrentFirebaseUser(): FirebaseUser | null {
      return auth.currentUser;
    }
  }