import { db } from "@/components/lib/firebase"; // Instance firestore() native
import firestore from "@react-native-firebase/firestore";
import { useState } from "react";
import { broadcastNotification } from "../../../helpers/useNotificationforLearnerAttendance";

export function useAttendance() {
  const [loading, setLoading] = useState(false);

  // ─────────────────────────────────────────
  // 🎟️ CRÉER UNE SESSION (Trainer)
  // ─────────────────────────────────────────
  const createAttendanceSession = async (trainingId, trainingTitle) => {
    setLoading(true);
    try {
      // A. Désactiver les anciennes sessions (Batch Natif)
      const qOld = db
        .collection("attendance_sessions")
        .where("trainingId", "==", trainingId)
        .where("active", "==", true);

      const oldSnap = await qOld.get();

      if (!oldSnap.empty) {
        const batch = firestore().batch(); // ✅ Batch Natif
        oldSnap.docs.forEach((d) => {
          batch.update(d.ref, { active: false });
        });
        await batch.commit();
      }

      // B. Créer la session
      const code = Math.floor(1000 + Math.random() * 9000).toString();
      const expiresAt = firestore.Timestamp.fromDate(
        new Date(Date.now() + 15 * 60000),
      );

      const sessionData = {
        trainingId,
        trainingTitle,
        code,
        active: true,
        expiresAt,
        createdAt: firestore.FieldValue.serverTimestamp(),
      };

      const sessionRef = await db
        .collection("attendance_sessions")
        .add(sessionData);

      // C. Récupération des tokens (Optimisé via le document formation)
      const formationSnap = await db
        .collection("formations")
        .doc(trainingId)
        .get();
      const participants = formationSnap.data()?.participants || [];

      // On récupère les tokens. Note: si tu as migré vers le stockage de tokens
      // dans la collection 'users', il faudra peut-être une petite requête In.
      const tokens = participants
        .map((p) => p.expoPushToken)
        .filter((token) => !!token);

      if (tokens.length > 0) {
        broadcastNotification(tokens, trainingTitle, code).catch(console.error);
      }

      return { code, sessionId: sessionRef.id };
    } catch (err) {
      console.error("Erreur session native:", err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────
  // ✍️ VALIDER L'ÉMARGEMENT (Learner)
  // ─────────────────────────────────────────
  const validateAttendance = async (
    trainingId,
    userId,
    inputCode,
    trainingTitle,
    userName,
  ) => {
    setLoading(true);
    try {
      // 1. Chercher la session active avec ce code
      const q = db
        .collection("attendance_sessions")
        .where("trainingId", "==", trainingId)
        .where("code", "==", inputCode.toString().trim())
        .where("active", "==", true);

      const snapshot = await q.get();

      if (snapshot.empty) {
        throw new Error("Code incorrect ou session fermée.");
      }

      const sessionDoc = snapshot.docs[0];
      const sessionData = sessionDoc.data();

      // 2. Vérification de l'expiration (Natif)
      if (sessionData.expiresAt.toDate() < new Date()) {
        throw new Error("Le code a expiré.");
      }

      // 3. Enregistrer l'émargement (ID Unique pour éviter les doublons)
      const attendanceId = `${sessionDoc.id}_${userId}`;
      await db
        .collection("attendance")
        .doc(attendanceId)
        .set({
          trainingId,
          trainingTitle: trainingTitle || sessionData.trainingTitle,
          userId,
          userName: userName || "Apprenant",
          status: "present",
          timestamp: firestore.FieldValue.serverTimestamp(),
          sessionId: sessionDoc.id,
        });

      return { success: true };
    } catch (err) {
      console.error("Erreur validation native:", err);
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  return { createAttendanceSession, validateAttendance, loading };
}
