import "react-native-get-random-values";

// components/lib/firebase.js
import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp } from "firebase/app";
import { getReactNativePersistence, initializeAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyA5Yf9DjGeReh3YrhGsR2JBmTCb3XECMKk",
  authDomain: "edutrack-8498a.firebaseapp.com",
  projectId: "edutrack-8498a",
  storageBucket: "edutrack-8498a.firebasestorage.app",
  messagingSenderId: "887821707830",
  appId: "1:887821707830:web:eaeaafaf645e27419d0697",
};

const app = initializeApp(firebaseConfig);

// ✅ Utiliser initializeAuth avec AsyncStorage pour Expo
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// ✅ Utiliser getStorage avec AsyncStorage pour Expo
export const storage = getStorage(app);

export const db = getFirestore(app);
