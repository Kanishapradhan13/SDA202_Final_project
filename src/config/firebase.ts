import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

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
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Configure emulators for development (optional)
// Uncomment these lines if you want to use Firebase emulators
/*
if (__DEV__ && !auth._delegate._config.emulator) {
  connectAuthEmulator(auth, 'http://localhost:9099');
  connectFirestoreEmulator(db, 'localhost', 8080);
  connectStorageEmulator(storage, 'localhost', 9199);
}
*/

export default app;