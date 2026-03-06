// components/lib/firebase.js
import { getApp, getApps, initializeApp } from "@react-native-firebase/app";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import storage from "@react-native-firebase/storage";

// ✅ Settings AVANT d'exporter db
firestore().settings({
  persistence: true, // ← cache persistant activé
  cacheSizeBytes: -1, // ← -1 = unlimited dans @react-native-firebase
});

const app = getApps().length === 0 ? initializeApp() : getApp();

export const db = firestore(app);
export const firebaseAuth = auth(app);
export const firebaseStorage = storage(app);
