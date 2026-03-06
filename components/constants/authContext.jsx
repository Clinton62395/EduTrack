import { firebaseAuth as auth, db } from "@/components/lib/firebase";
import { useSegments } from "expo-router";
import { createContext, useContext, useEffect, useState } from "react";
// components/constants/authContext.jsx
// Assure-toi que ton fichier firebase.js exporte bien 'auth' et 'db'
import { onAuthStateChanged } from "@react-native-firebase/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const segments = useSegments();

  useEffect(() => {
    let unsubscribeSnapshot = null;

    // ✅ CORRECT : On passe 'auth' directement (c'est déjà l'instance)
    // Ne pas écrire auth(), car dans ton lib/firebase tu as déjà fait auth()
    const unsubscribeAuth = onAuthStateChanged(auth, async (fbUser) => {
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
        unsubscribeSnapshot = null;
      }

      if (!fbUser) {
        setProfile(null);
        setLoading(false);
        // ... logique de redirection
        return;
      }

      // ✅ CORRECT : db est déjà l'instance, on l'utilise directement
      // Ne pas écrire db().collection(...)
      const userRef = db.collection("users").doc(fbUser.uid);

      unsubscribeSnapshot = userRef.onSnapshot(
        async (snap) => {
          if (!snap || !snap.exists) {
            setProfile(null);
            setLoading(false);
            return;
          }

          const data = snap.data();

          // Logique MasterCode...

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
  // ... le reste de ton code (logout, etc.)
  const logout = async () => {
    try {
      await auth.signOut();
      // Le onAuthStateChanged s'occupera du reste (setProfile + navigation)
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
