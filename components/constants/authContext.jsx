// components/constants/authContext.jsx
import { firebaseAuth as auth, db } from "@/components/lib/firebase";
import { onAuthStateChanged, signOut } from "@react-native-firebase/auth";
import { doc, onSnapshot } from "@react-native-firebase/firestore";
import { useSegments } from "expo-router";
import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const segments = useSegments();

  useEffect(() => {
    let unsubscribeSnapshot = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (fbUser) => {
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
        unsubscribeSnapshot = null;
      }

      if (!fbUser) {
        setProfile(null);
        setLoading(false);
        return;
      }

      // ✅ v22 modular
      const userRef = doc(db, "users", fbUser.uid);
      unsubscribeSnapshot = onSnapshot(
        userRef,
        (snap) => {
          if (!snap || !snap.exists()) {
            setProfile(null);
            setLoading(false);
            return;
          }
          const data = snap.data();
          setProfile({ uid: fbUser.uid, ...data });
          setLoading(false);
        },
        (error) => {
          console.error("Auth Snapshot Error:", error);
          setLoading(false);
        },
      );
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }, [segments]);

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user: profile, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
