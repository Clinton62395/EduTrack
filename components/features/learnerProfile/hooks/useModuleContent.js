import { db } from "@/components/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";

export function useModuleContent(trainingId, moduleId) {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const docRef = doc(db, "formations", trainingId, "modules", moduleId);
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
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
