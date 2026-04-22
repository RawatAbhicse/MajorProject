import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
};

const hasFirebaseConfig = Object.values(firebaseConfig).every(
  (value) => typeof value === 'string' && value.trim().length > 0 && !value.includes('YOUR_')
);

let auth = null;
let db = null;
let storage = null;
let realtimeDb = null;

if (hasFirebaseConfig) {
  const app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  realtimeDb = getDatabase(app);
} else {
  // Keep app running if Firebase env vars are not configured.
  console.warn('Firebase is not configured. Add REACT_APP_FIREBASE_* variables in Frontend/.env.');
}

export { auth, db, storage, realtimeDb, hasFirebaseConfig };