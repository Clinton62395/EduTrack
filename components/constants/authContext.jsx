import { auth, db } from "@/components/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeSnapshot = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      // 1. Si déconnexion, on nettoie tout
      if (!firebaseUser) {
        if (unsubscribeSnapshot) unsubscribeSnapshot();
        setUser(null);
        setLoading(false);
        return;
      }

      // 2. ÉCOUTE EN TEMPS RÉEL DU PROFIL FIRESTORE
      const userRef = doc(db, "users", firebaseUser.uid);

      unsubscribeSnapshot = onSnapshot(
        userRef,
        async (snap) => {
          if (snap.exists()) {
            const userData = snap.data();

            // --- LOGIQUE MASTER CODE (PRD) ---
            // Si c'est un formateur et qu'il n'a pas de code, on en génère un
            if (userData.role === "trainer" && !userData.masterCode) {
              const newCode =
                "EDU-" +
                Math.random().toString(36).substring(2, 7).toUpperCase();
              await updateDoc(userRef, { masterCode: newCode });
              // onSnapshot se déclenchera à nouveau automatiquement après l'update
            }

            setUser({
              uid: firebaseUser.uid,
              ...userData,
            });
          } else {
            setUser(null);
          }
          setLoading(false);
        },
        (error) => {
          console.error("Erreur Snapshot User:", error);
          setLoading(false);
        },
      );
    });

    // Nettoyage à la destruction du composant
    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }, []);

  // Fonction de rafraîchissement manuel (optionnelle mais utile pour l'UX)
  const refreshUser = async () => {
    if (!auth.currentUser) return;
    try {
      const snap = await getDoc(doc(db, "users", auth.currentUser.uid));
      if (snap.exists()) {
        setUser({ uid: auth.currentUser.uid, ...snap.data() });
      }
    } catch (e) {
      console.error("Erreur refresh manuel:", e);
    }
  };

  const logout = async () => {
    setUser(null);
    await auth.signOut();
  };

  const value = { user, loading, logout, refreshUser };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within a AuthProvider");
  }
  return context;
};
