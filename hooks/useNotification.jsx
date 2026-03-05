import { useAuth } from "@/components/constants/authContext";
import { db } from "@/components/lib/firebase";
import { useState } from "react"; // firestore methods used via db

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
        await db
          .collection("users")
          .doc(user.uid)
          .update({
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
