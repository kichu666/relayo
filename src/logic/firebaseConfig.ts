import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getDatabase, Database } from 'firebase/database';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

// Default demonstration Firebase configuration for instant out-of-the-box sync
const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyD-DemoRelayoCloudKey123456789",
  authDomain: "relayo-cloud-app.firebaseapp.com",
  databaseURL: "https://relayo-cloud-app-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "relayo-cloud-app",
  storageBucket: "relayo-cloud-app.appspot.com",
  messagingSenderId: "987654321098",
  appId: "1:987654321098:web:a1b2c3d4e5f6g7h8i9j0"
};

const getFirebaseConfig = () => {
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  const databaseURL = import.meta.env.VITE_FIREBASE_DATABASE_URL;
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;

  if (apiKey && projectId) {
    return {
      apiKey,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || `${projectId}.firebaseapp.com`,
      databaseURL: databaseURL || `https://${projectId}-default-rtdb.firebaseio.com`,
      projectId,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || `${projectId}.appspot.com`,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "00000000000",
      appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:00000000000:web:0000000000000000",
    };
  }

  return DEFAULT_FIREBASE_CONFIG;
};

let app: FirebaseApp | null = null;
let db: Database | null = null;
let firestore: Firestore | null = null;
let storage: FirebaseStorage | null = null;

try {
  const config = getFirebaseConfig();
  if (!getApps().length) {
    app = initializeApp(config);
  } else {
    app = getApp();
  }
  db = getDatabase(app);
  firestore = getFirestore(app);
  storage = getStorage(app);
} catch (error) {
  console.warn('[Relayo Firebase] Initialization warning:', error);
}

export { app, db, firestore, storage };
