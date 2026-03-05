import { db } from "@/components/lib/firebase"; // Instance firestore() native
import { useEffect, useState } from "react";

/**
 * Récupère les détails d'un module spécifique en temps réel.
 * Chemin : formations/{trainingId}/modules/{moduleId}
 */
export function useModuleContent(trainingId, moduleId) {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 🔒 Sécurité si les IDs sont manquants
    if (!trainingId || !moduleId) {
      setContent(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Référence au document du module
    const moduleRef = db
      .collection("formations")
      .doc(trainingId)
      .collection("modules")
      .doc(moduleId);

    // Utilisation de onSnapshot pour le temps réel natif
    const unsubscribe = moduleRef.onSnapshot(
      (doc) => {
        if (doc.exists) {
          setContent({ id: doc.id, ...doc.data() });
        } else {
          setContent(null);
        }
        setLoading(false);
      },
      (error) => {
        console.error("Erreur native useModuleContent:", error);
        setLoading(false);
      },
    );

    // Nettoyage de l'écouteur à la destruction du composant
    return () => unsubscribe();
  }, [trainingId, moduleId]);

  return { content, loading };
}
