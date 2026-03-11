import { useAuth } from "@/components/constants/authContext";
import { db } from "@/components/lib/firebase";
import { doc, updateDoc } from "@react-native-firebase/firestore";
import { useEffect, useState } from "react";

export function useNotifications() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const [prefs, setPrefs] = useState({
    push: true,
    email: true,
    formations: true,
    messages: true,
  });

  // 🔄 Synchronisation initiale
  useEffect(() => {
    if (user?.notificationPrefs) {
      setPrefs({
        push: user.notificationPrefs.push ?? true,
        email: user.notificationPrefs.email ?? true,
        formations: user.notificationPrefs.formations ?? true,
        messages: user.notificationPrefs.messages ?? true,
      });
    }
  }, [user?.notificationPrefs]);

  /**
   * Alterne une préférence avec dot notation Firestore
   * + optimistic UI + rollback en cas d'erreur
   */
  const togglePref = async (key) => {
    if (!user?.uid) return;
    const newVal = !prefs[key];

    // Optimistic UI
    setPrefs((prev) => ({ ...prev, [key]: newVal }));

    try {
      setLoading(true);
      await updateDoc(doc(db, "users", user.uid), {
        [`notificationPrefs.${key}`]: newVal,
      });
    } catch (error) {
      console.error("Erreur update prefs:", error);
      // Rollback
      setPrefs((prev) => ({ ...prev, [key]: !newVal }));
    } finally {
      setLoading(false);
    }
  };

  const themeColor = user?.role === "trainer" ? "secondary" : "info";

  return { prefs, togglePref, loading, themeColor };
}
