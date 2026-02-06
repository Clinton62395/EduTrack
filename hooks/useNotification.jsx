import { useAuth } from "@/components/constants/authContext";
import { db } from "@/components/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { useState } from "react";

export function useNotifications() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  // États pour les différents types de notifications
  const [prefs, setPrefs] = useState({
    push: user?.notificationPrefs?.push ?? true,
    email: user?.notificationPrefs?.email ?? true,
    formations: user?.notificationPrefs?.formations ?? true,
    messages: user?.notificationPrefs?.messages ?? true,
  });

  const togglePref = async (key) => {
    const newVal = !prefs[key];
    setPrefs((prev) => ({ ...prev, [key]: newVal }));

    try {
      if (user?.uid) {
        await updateDoc(doc(db, "users", user.uid), {
          [`notificationPrefs.${key}`]: newVal,
        });
      }
    } catch (error) {
      console.error("Erreur update prefs:", error);
    }
  };

  const themeColor = user?.role === "trainer" ? "secondary" : "info";

  return { prefs, togglePref, loading, themeColor };
}
