import { db } from "@/components/lib/firebase";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  Timestamp,
  where,
  writeBatch,
} from "firebase/firestore";
import { useState } from "react";
import { broadcastNotification } from "../../../helpers/useNotificationforLearnerAttendance";

export function useAttendance() {
  const [loading, setLoading] = useState(false);

  // ===============================
  // 📢 TRAINER : Créer une session + Notifier
  // ===============================
  const createAttendanceSession = async (trainingId, trainingTitle) => {
    setLoading(true);
    try {
      // A. Désactiver les anciennes sessions actives pour cette formation
      const qOld = query(
        collection(db, "attendance_sessions"),
        where("trainingId", "==", trainingId),
        where("active", "==", true),
      );
      const oldSnap = await getDocs(qOld);
      if (!oldSnap.empty) {
        const batch = writeBatch(db);
        oldSnap.docs.forEach((d) => batch.update(d.ref, { active: false }));
        await batch.commit();
      }

      // B. Créer la nouvelle session
      const code = Math.floor(1000 + Math.random() * 9000).toString();
      const expiresAt = Timestamp.fromDate(new Date(Date.now() + 15 * 60000));

      const sessionRef = await addDoc(collection(db, "attendance_sessions"), {
        trainingId,
        trainingTitle,
        code,
        active: true,
        expiresAt,
        createdAt: serverTimestamp(),
      });

      // C. Récupérer les tokens des participants pour la notification
      const formationSnap = await getDoc(doc(db, "formations", trainingId));
      const participantIds = formationSnap.data()?.participants || [];

      const tokens = [];
      for (const userId of participantIds) {
        const userSnap = await getDoc(doc(db, "users", userId));
        const token = userSnap.data()?.expoPushToken;
        if (token) tokens.push(token);
      }

      if (tokens.length > 0) {
        await broadcastNotification(tokens, trainingTitle, code);
      }

      return { code, sessionId: sessionRef.id };
    } catch (err) {
      console.error("Erreur création session:", err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // ✅ LEARNER : Valider son code
  // ===============================
  const validateAttendance = async (
    trainingId,
    userId,
    inputCode,
    trainingTitle,
  ) => {
    setLoading(true);
    try {
      console.log("Tentative de validation...", { trainingId, inputCode });

      // 1. Chercher la session correspondante
      const q = query(
        collection(db, "attendance_sessions"),
        where("trainingId", "==", trainingId),
        where("code", "==", inputCode.toString().trim()),
        where("active", "==", true),
      );

      const snapshot = await getDocs(q);

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
      await addDoc(collection(db, "attendance"), {
        trainingId,
        trainingTitle: trainingTitle || sessionData.trainingTitle,
        userId,
        status: "present",
        timestamp: serverTimestamp(),
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

  return { createAttendanceSession, validateAttendance, loading };
}
