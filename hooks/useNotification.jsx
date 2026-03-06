import { useAuth } from "@/components/constants/authContext";
import { db } from "@/components/lib/firebase"; // Instance firestore() native
import { useEffect, useState } from "react";

/**
 * Gère les préférences de notifications de l'utilisateur.
 * Utilise la mise à jour d'objets imbriqués native de Firestore.
 */
export function useNotifications() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  // 1. État local synchronisé avec les données user
  const [prefs, setPrefs] = useState({
    push: true,
    email: true,
    formations: true,
    messages: true,
  });

  // 🔄 Synchronisation initiale et lors des updates de l'objet user
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
   * Alterne une préférence et la sauvegarde dans Firestore.
   * Utilise la "dot notation" pour ne mettre à jour que la clé concernée.
   */
  const togglePref = async (key) => {
    if (!user?.uid) return;

    const newVal = !prefs[key];

    // Optimistic UI : on met à jour l'interface immédiatement
    setPrefs((prev) => ({ ...prev, [key]: newVal }));

    try {
      setLoading(true);
      await db
        .collection("users")
        .doc(user.uid)
        .update({
          [`notificationPrefs.${key}`]: newVal,
        });
    } catch (error) {
      console.error("Erreur native update prefs:", error);
      // Rollback en cas d'erreur
      setPrefs((prev) => ({ ...prev, [key]: !newVal }));
    } finally {
      setLoading(false);
    }
  };

  const themeColor = user?.role === "trainer" ? "secondary" : "info";

  return { prefs, togglePref, loading, themeColor };
}
