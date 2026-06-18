import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  GithubAuthProvider,
  OAuthProvider,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyC1g32siIEOJHbQCxm9ssPpKSac9ANu_lM',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'fahrixzstore-c9de7.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'fahrixzstore-c9de7',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'fahrixzstore-c9de7.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '29590938796',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:29590938796:web:e0e280930ce90a1992ab09',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-3F3XKS5JFT',
};

// Only initialize if API key is present
let app = null;
let auth = null;
let db = null;
let storage = null;

if (firebaseConfig.apiKey) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
  } catch (error) {
    console.error('Firebase initialization error:', error);
  }
} else {
  console.warn('Firebase not initialized: VITE_FIREBASE_API_KEY is missing. Add environment variables in Vercel dashboard.');
}

// Auth Providers
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

export const githubProvider = new GithubAuthProvider();
githubProvider.addScope('read:user');
githubProvider.addScope('user:email');

export const appleProvider = new OAuthProvider('apple.com');
appleProvider.addScope('email');
appleProvider.addScope('name');

export { app, auth, db, storage };
export default app;
