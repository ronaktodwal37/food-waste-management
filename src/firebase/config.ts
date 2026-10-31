/**
 * Client Firebase SDK Configuration Placeholder
 * Reads VITE_FIREBASE_* variables with safe fallback for initial boot.
 * Activated in Phase 2 for client-side Auth and Firestore listeners.
 */
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyPlaceholderKeyForPhase1Only',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'zero-waste-platform.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'zero-waste-platform',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'zero-waste-platform.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '1234567890',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:1234567890:web:abcdef123456',
};

export const isFirebaseClientConfigured = Boolean(
  import.meta.env.VITE_FIREBASE_API_KEY &&
  import.meta.env.VITE_FIREBASE_PROJECT_ID
);

let app: FirebaseApp | undefined;

if (getApps().length === 0) {
  try {
    app = initializeApp(firebaseConfig);
  } catch (e) {
    console.warn('[Firebase Client] Init warning in Phase 1:', e);
  }
} else {
  app = getApps()[0];
}

export { app, firebaseConfig };
