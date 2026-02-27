// components/features/learnerProfile/hooks/useLearnerTrainingDetail.js
import { db } from "@/components/lib/firebase";
import { useModules } from "@/hooks/useModule";
import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";

export function useLearnerTrainingDetail(formationId) {
  const [formation, setFormation] = useState(null);
  const [loading, setLoading] = useState(true);
  const { modules, loading: modulesLoading } = useModules(formationId);

  useEffect(() => {
    if (!formationId) return;
    const unsubscribe = onSnapshot(
      doc(db, "formations", formationId),
      (snapshot) => {
        if (snapshot.exists()) {
          setFormation({ id: snapshot.id, ...snapshot.data() });
        }
        setLoading(false);
      },
      (error) => {
        console.error("Erreur detail formation:", error);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [formationId]);

  return {
    formation,
    modules,
    loading: loading || modulesLoading,
  };
}