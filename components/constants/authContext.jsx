import { firebaseAuth as auth, db } from "@/components/lib/firebase";
import { onAuthStateChanged, signOut } from "@react-native-firebase/auth";
import { doc, onSnapshot } from "@react-native-firebase/firestore";
import { router } from "expo-router";
import { createContext, useContext, useEffect, useRef, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Ref pour éviter les redirections multiples
  const isRedirecting = useRef(false);

  useEffect(() => {
    let unsubscribeSnapshot = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (fbUser) => {
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
        unsubscribeSnapshot = null;
      }

      // ─── DÉCONNECTÉ ───
      if (!fbUser) {
        setProfile(null);
        setLoading(false);

        if (!isRedirecting.current) {
          isRedirecting.current = true;
          // Petit délai pour laisser Expo Router s'initialiser
          setTimeout(() => {
            router.replace("/(onboarding)");
            isRedirecting.current = false;
          }, 50);
        }
        return;
      }

      // ─── CONNECTÉ ───
      isRedirecting.current = false;
      const userRef = doc(db, "users", fbUser.uid);

      unsubscribeSnapshot = onSnapshot(
        userRef,
        (snap) => {
          if (!snap || !snap.exists()) {
            setProfile(null);
            setLoading(false);
            router.replace("/(auth)/login");
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
  }, []);

  // ─────────────────────────────────────────
  // 🚪 LOGOUT
  // ─────────────────────────────────────────
  const logout = async () => {
    try {
      // ✅ Reset immédiat du profil — tous les hooks
      // qui lisent user verront null immédiatement
      // et afficheront leur état vide sans crasher
      setProfile(null);

      // ✅ Redirection immédiate — pas d'attente de Firebase
      router.replace("/(onboarding)");

      // Firebase signOut en arrière-plan
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
