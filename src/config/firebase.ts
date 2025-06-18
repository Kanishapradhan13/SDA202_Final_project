// src/config/firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyBTlaegVvAks3LjZZCrqH1lpbXOt9PyKvE",
  authDomain: "tinder-9baba.firebaseapp.com",
  projectId: "tinder-9baba",
  storageBucket: "tinder-9baba.firebasestorage.app",
  messagingSenderId: "955665773501",
  appId: "1:955665773501:web:00827ed0db4db7ed45d8d4",
  measurementId: "G-S3RW7D0V5J"
};

// Initialize Firebase
let app;

if (getApps().length === 0) {
  console.log('Initializing Firebase app...');
  app = initializeApp(firebaseConfig);
} else {
  console.log('Firebase app already initialized');
  app = getApp();
}

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;