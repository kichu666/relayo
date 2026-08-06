import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getDatabase, Database } from "firebase/database";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCqksqI_aMuIsDpFkK-puu9mxONezpDnB8",
  authDomain: "relayoworld.firebaseapp.com",
  databaseURL: "https://relayoworld-default-rtdb.firebaseio.com",
  projectId: "relayoworld",
  storageBucket: "relayoworld.firebasestorage.app",
  messagingSenderId: "207313754890",
  appId: "1:207313754890:web:32c341af30faaa36e9f8f3",
  measurementId: "G-CPWES02XDP"
};

export const app: FirebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db: Database = getDatabase(app);
export const firestore: Firestore = getFirestore(app);
export const storage: FirebaseStorage = getStorage(app);
