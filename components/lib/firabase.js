// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA5Yf9DjGeReh3YrhGsR2JBmTCb3XECMKk",
  authDomain: "edutrack-8498a.firebaseapp.com",
  projectId: "edutrack-8498a",
  storageBucket: "edutrack-8498a.firebasestorage.app",
  messagingSenderId: "887821707830",
  appId: "1:887821707830:web:eaeaafaf645e27419d0697",
  measurementId: "G-S0HDP0FVWW",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
