// hooks/useAttendance.js
import { db } from "@/components/lib/firebase";
import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { useState } from "react";

export function useAttendance() {
  const [loading, setLoading] = useState(false);

  // --- POUR LE TRAINER : Créer une session ---
  const createAttendanceSession = async (trainingId) => {
    const code = Math.floor(1000 + Math.random() * 9000).toString(); // Code à 4 chiffres
    const expiresAt = new Date(Date.now() + 15 * 60000); // Valide 15 minutes

    const sessionRef = await addDoc(collection(db, "attendance_sessions"), {
      trainingId,
      code,
      expiresAt,
      createdAt: serverTimestamp(),
    });

    return { code, sessionId: sessionRef.id };
  };

  // --- POUR LE LEARNER : Valider son code ---
  const validateAttendance = async (trainingId, userId, inputCode) => {
    setLoading(true);
    try {
      // 1. Chercher la session active pour cette formation
      const q = query(
        collection(db, "attendance_sessions"),
        where("trainingId", "==", trainingId),
        where("code", "==", inputCode),
      );

      const snapshot = await getDocs(q);

      if (snapshot.empty) throw new Error("Code incorrect.");

      const sessionData = snapshot.docs[0].data();
      if (sessionData.expiresAt.toDate() < new Date()) {
        throw new Error("Le code a expiré.");
      }

      // 2. Créer la preuve de présence
      await addDoc(collection(db, "attendance"), {
        trainingId,
        userId,
        status: "present",
        timestamp: serverTimestamp(),
        sessionId: snapshot.docs[0].id,
      });

      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  return { createAttendanceSession, validateAttendance, loading };
}
