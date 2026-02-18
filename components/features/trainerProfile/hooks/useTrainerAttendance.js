import { db } from "@/components/lib/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useState } from "react";

export function useTrainerAttendance() {
  const [loading, setLoading] = useState(false);
  const [activeCode, setActiveCode] = useState(null);

  const startNewSession = async (trainingId) => {
    setLoading(true);
    try {
      // Génération d'un code à 4 chiffres
      const code = Math.floor(1000 + Math.random() * 9000).toString();

      // La session expire dans 15 minutes
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 15);

      await addDoc(collection(db, "attendance_sessions"), {
        trainingId,
        code,
        createdAt: serverTimestamp(),
        expiresAt: expiresAt,
        active: true,
      });

      setActiveCode(code);
      return code;
    } catch (error) {
      console.error("Erreur session présence:", error);
    } finally {
      setLoading(false);
    }
  };

  return { startNewSession, activeCode, loading };
}
