// components/lib/firebase.js
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import storage from "@react-native-firebase/storage";

// ✅ Settings AVANT d'exporter db
firestore().settings({
  persistence: true, // ← cache persistant activé
  cacheSizeBytes: -1, // ← -1 = unlimited dans @react-native-firebase
});

export const db = firestore();
export const firebaseAuth = auth();
export const firebaseStorage = storage();
