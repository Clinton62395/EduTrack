import { db } from "@/components/lib/firebase";
import { useEffect, useState } from "react"; // firestore operations via db

export function useModuleContent(trainingId, moduleId) {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const snapshot = await db
          .collection("formations")
          .doc(trainingId)
          .collection("modules")
          .doc(moduleId)
          .get();
        if (snapshot.exists) {
          setContent(snapshot.data());
        }
      } catch (error) {
        console.error("Erreur contenu:", error);
      } finally {
        setLoading(false);
      }
    };

    if (trainingId && moduleId) fetchContent();
  }, [trainingId, moduleId]);

  return { content, loading };
}
