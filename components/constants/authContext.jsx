import { firebaseAuth as auth, db } from "@/components/lib/firebase";
import { router, useSegments } from "expo-router";
import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const segments = useSegments();

  useEffect(() => {
    let unsubscribeSnapshot = null;

    // 🔐 Écoute de l'état de connexion Firebase Auth
    const unsubscribeAuth = auth.onAuthStateChanged(async (fbUser) => {
      // Nettoyage de l'ancien listener Firestore si l'utilisateur change/part
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
        unsubscribeSnapshot = null;
      }

      if (!fbUser) {
        setProfile(null);
        setLoading(false);
        // Redirection vers onboarding uniquement si on n'y est pas déjà
        const inAuthGroup = segments[0] === "(onboarding)";
        if (!inAuthGroup) router.replace("/(onboarding)");
        return;
      }

      // 📡 Écoute en temps réel du document utilisateur dans Firestore
      const userRef = db.collection("users").doc(fbUser.uid);

      unsubscribeSnapshot = userRef.onSnapshot(
        async (snap) => {
          if (!snap && !snap.exists) {
            setProfile(null);
            setLoading(false);
            return;
          }

          const data = snap.data();

          // 🛠️ Auto-réparation : Génération du MasterCode si manquant (Trainer)
          if (data.role === "trainer" && !data.masterCode) {
            const newCode =
              "EDU-" + Math.random().toString(36).substring(2, 7).toUpperCase();
            await userRef.update({ masterCode: newCode });
            // Le snapshot se redéclenchera tout seul après l'update
            return;
          }

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
  }, [segments]); // On observe les segments pour la logique de navigation

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
