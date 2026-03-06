import { db } from "@/components/lib/firebase"; // Instance firestore() native
import firestore from "@react-native-firebase/firestore";
import { useState } from "react";
import { broadcastNotification } from "../../../helpers/useNotificationforLearnerAttendance";

/**
 * Hook de gestion de l'émargement (Attendance).
 * Gère la création de sessions sécurisées et la validation par les apprenants.
 */
export function useAttendance() {
  const [loading, setLoading] = useState(false);

  // ─────────────────────────────────────────
  // 🎟️ CRÉER UNE SESSION (Trainer)
  // ─────────────────────────────────────────
  const createAttendanceSession = async (trainingId, trainingTitle) => {
    setLoading(true);
    try {
      // 1. Désactiver les anciennes sessions via un Write Batch (Atomique)
      const qOld = db
        .collection("attendance_sessions")
        .where("trainingId", "==", trainingId)
        .where("active", "==", true);

      const oldSnap = await qOld.get();

      if (!oldSnap.empty) {
        const batch = firestore().batch();
        oldSnap.docs.forEach((doc) => {
          batch.update(doc.ref, {
            active: false,
            closedAt: firestore.FieldValue.serverTimestamp(),
          });
        });
        await batch.commit();
      }

      // 2. Générer un code unique et une expiration (15 min)
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

      // 3. Notification Push (Broadcast)
      const formationSnap = await db
        .collection("formations")
        .doc(trainingId)
        .get();
      const participants = formationSnap.data()?.participants || [];

      const tokens = participants
        .map((p) => p.expoPushToken)
        .filter((token) => !!token);

      if (tokens.length > 0) {
        broadcastNotification(tokens, trainingTitle, code).catch(console.error);
      }

      return { code, sessionId: sessionRef.id };
    } catch (err) {
      console.error("Erreur création session:", err);
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
      // 1. Recherche de la session active correspondante
      const q = db
        .collection("attendance_sessions")
        .where("trainingId", "==", trainingId)
        .where("code", "==", inputCode.toString().trim())
        .where("active", "==", true);

      const snapshot = await q.get();

      if (snapshot.empty) {
        throw new Error("Code incorrect ou session expirée.");
      }

      const sessionDoc = snapshot.docs[0];
      const sessionData = sessionDoc.data();

      // 2. Vérification temporelle (Timestamp Natif)
      if (sessionData.expiresAt.toDate() < new Date()) {
        // Optionnel : fermer la session automatiquement si elle est périmée
        await sessionDoc.ref.update({ active: false });
        throw new Error("Le code a expiré.");
      }

      // 3. Enregistrement de la présence
      // On utilise un ID prédictif (sessionId_userId) pour empêcher le double pointage
      const attendanceId = `${sessionDoc.id}_${userId}`;
      await db
        .collection("attendance")
        .doc(attendanceId)
        .set(
          {
            trainingId,
            trainingTitle: trainingTitle || sessionData.trainingTitle,
            userId,
            userName: userName || "Apprenant",
            status: "present",
            timestamp: firestore.FieldValue.serverTimestamp(),
            sessionId: sessionDoc.id,
          },
          { merge: true },
        );

      return { success: true };
    } catch (err) {
      console.error("Erreur validation:", err);
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  return { createAttendanceSession, validateAttendance, loading };
}
