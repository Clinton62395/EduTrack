import { firebaseAuth as auth, db } from "@/components/lib/firebase";
import { router } from "expo-router";
import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeSnapshot = null;

    // ✅ @react-native-firebase — auth().onAuthStateChanged
    const unsubscribeAuth = auth.onAuthStateChanged(async (fbUser) => {
      if (!fbUser) {
        if (unsubscribeSnapshot) unsubscribeSnapshot();
        setProfile(null);
        setLoading(false);
        router.replace("/(onboarding)");
        return;
      }

      // ✅ @react-native-firebase — db.collection().doc() au lieu de doc(db, ...)
      const userRef = db.collection("users").doc(fbUser.uid);

      unsubscribeSnapshot = userRef.onSnapshot(
        async (snap) => {
          if (!snap.exists) {
            // ✅ .exists sans () dans @react-native-firebase
            setProfile(null);
            setLoading(false);
            return;
          }

          const data = snap.data();

          if (data.role === "trainer" && !data.masterCode) {
            const newCode =
              "EDU-" + Math.random().toString(36).substring(2, 7).toUpperCase();
            await userRef.update({ masterCode: newCode }); // ✅ .update() au lieu de updateDoc()
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
    setProfile(null);
    router.replace("/(onboarding)");
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
