import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Demo mode configuration - works without actual Firebase
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'demo-api-key',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'demo-project.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'demo-project',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'demo-project.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:123456789:web:abcdef',
};

// Check if we have a valid configuration
export const hasValidConfig = firebaseConfig.apiKey !== 'demo-api-key' && firebaseConfig.apiKey.length > 10;
export const isDemoMode = !hasValidConfig;

let app;
let auth;

try {
  // Initialize Firebase (even in demo mode for structure)
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);

  if (isDemoMode) {
    console.warn('⚠️ Running in DEMO MODE - Firebase not configured. Authentication will use mock data.');
  }
} catch (error) {
  console.error('Firebase initialization error:', error);
  console.warn('⚠️ Running in DEMO MODE - Authentication will use mock data.');
}

export { auth };
export default app;
