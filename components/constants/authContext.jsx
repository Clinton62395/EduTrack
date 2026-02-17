import { auth, db } from "@/components/lib/firebase";
import { router } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeSnapshot = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (fbUser) => {
      if (!fbUser) {
        if (unsubscribeSnapshot) unsubscribeSnapshot();
        setProfile(null);
        setLoading(false);
        router.replace("/login"); // redirige dès logout
        return;
      }

      const userRef = doc(db, "users", fbUser.uid);

      unsubscribeSnapshot = onSnapshot(
        userRef,
        async (snap) => {
          if (!snap.exists()) {
            setProfile(null);
            setLoading(false);
            return;
          }

          const data = snap.data();
          if (data.role === "trainer" && !data.masterCode) {
            const newCode =
              "EDU-" + Math.random().toString(36).substring(2, 7).toUpperCase();
            await updateDoc(userRef, { masterCode: newCode });
            return;
          }

          setProfile({ uid: fbUser.uid, ...data });
          setLoading(false);
        },
        (error) => {
          console.error("Snapshot Error:", error);
          setProfile(null);
          setLoading(false);
        },
      );
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }, []);

  const logout = async () => {
    await auth.signOut();
    setProfile(null); // facultatif, snapshot redirige déjà
  };

  return (
    <AuthContext.Provider value={{ user: profile, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within a AuthProvider");
  }
  return context;
};
