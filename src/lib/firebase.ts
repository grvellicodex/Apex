import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth();

// Test connection and sign in anonymously for the "anonymous sharing" feature
export async function initializeFirebase() {
  try {
    if (!auth.currentUser) {
      await signInAnonymously(auth);
    }
  } catch (error: any) {
    if (error?.code === 'auth/admin-restricted-operation') {
      console.warn("Firebase Error: Anonymous Authentication is disabled. Please enable it in your Firebase Console (Authentication > Sign-in method).");
      throw error;
    } else {
      console.error("Firebase Initialization Error:", error);
      throw error;
    }
  }
}
