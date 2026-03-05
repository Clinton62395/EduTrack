import { db } from "@/components/lib/firebase";
import firestore from "@react-native-firebase/firestore";
import { useState } from "react";
import { broadcastNotification } from "../../../helpers/useNotificationforLearnerAttendance";
// firestore via db; FieldValue via firestore.FieldValue; Timestamp via firestore.Timestamp

export function useAttendance() {
  const [loading, setLoading] = useState(false);

  const createAttendanceSession = async (trainingId, trainingTitle) => {
    setLoading(true);
    try {
      // A. Désactiver les anciennes sessions (Batch)
      const qOld = db
        .collection("attendance_sessions")
        .where("trainingId", "==", trainingId)
        .where("active", "==", true);
      const oldSnap = await qOld.get();
      if (!oldSnap.empty) {
        const batch = db.batch();
        oldSnap.docs.forEach((d) => batch.update(d.ref, { active: false }));
        await batch.commit();
      }

      // B. Créer la session
      const code = Math.floor(1000 + Math.random() * 9000).toString();
      const expiresAt = firestore.Timestamp.fromDate(
        new Date(Date.now() + 15 * 60000),
      );

      const sessionRef = await db.collection("attendance_sessions").add({
        trainingId,
        trainingTitle,
        code,
        active: true,
        expiresAt,
        createdAt: firestore.FieldValue.serverTimestamp(),
      });

      // C. RÉCUPÉRATION INSTANTANÉE DES TOKENS 🚀
      const formationSnap = await db
        .collection("formations")
        .doc(trainingId)
        .get();
      const participants = formationSnap.data()?.participants || [];

      // Plus de boucle for sur la collection users !
      // On extrait directement les tokens stockés dans la formation
      const tokens = participants
        .map((p) => p.expoPushToken)
        .filter((token) => !!token);

      if (tokens.length > 0) {
        // Envoi asynchrone (on n'attend pas forcément la fin pour retourner le code)
        broadcastNotification(tokens, trainingTitle, code).catch(console.error);
      }

      return { code, sessionId: sessionRef.id };
    } catch (err) {
      console.error("Erreur session:", err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const validateAttendance = async (
    trainingId,
    userId,
    inputCode,
    trainingTitle,
    userName,
  ) => {
    setLoading(true);
    try {
      console.log("Tentative de validation...", { trainingId, inputCode });

      // 1. Chercher la session correspondante
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

      // 2. Vérifier l'heure (Clock Skew protection : +1 min de marge)
      const now = new Date();
      if (sessionData.expiresAt.toDate().getTime() < now.getTime() - 60000) {
        throw new Error("Le code a expiré.");
      }

      // 3. Enregistrer l'émargement
      await db.collection("attendance").add({
        trainingId,
        trainingTitle: trainingTitle || sessionData.trainingTitle,
        userId,
        status: "present",
        userName: snapshot.data()?.userName || "Apprenant",
        timestamp: firestore.FieldValue.serverTimestamp(),
        sessionId: sessionDoc.id,
      });

      return { success: true };
    } catch (err) {
      console.error("Erreur validation:", err);
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  // ... (validateAttendance reste similaire, mais pointe vers cette logique)
  return { createAttendanceSession, validateAttendance, loading };
}
