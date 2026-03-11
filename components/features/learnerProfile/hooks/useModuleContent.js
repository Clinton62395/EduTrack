import { db } from "@/components/lib/firebase";
import { doc, onSnapshot } from "@react-native-firebase/firestore";
import { useEffect, useState } from "react";

/**
 * Récupère les détails d'un module spécifique en temps réel.
 * Chemin : formations/{trainingId}/modules/{moduleId}
 */
export function useModuleContent(trainingId, moduleId) {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!trainingId || !moduleId) {
      setContent(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    const moduleRef = doc(db, "formations", trainingId, "modules", moduleId);

    const unsubscribe = onSnapshot(
      moduleRef,
      (snap) => {
        setContent(snap.exists() ? { id: snap.id, ...snap.data() } : null);
        setLoading(false);
      },
      (error) => {
        console.error("Erreur useModuleContent:", error);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [trainingId, moduleId]);

  return { content, loading };
}
