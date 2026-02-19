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
} from "firebase/firestore";
import { useState } from "react";
import { broadcastNotification } from "../../../helpers/useNotificationforLearnerAttendance";

export function useAttendance() {
  const [loading, setLoading] = useState(false);

  // ===============================
  // 📢 TRAINER : Créer une session + Notifier les apprenants
  // ===============================
  const createAttendanceSession = async (trainingId, trainingTitle) => {
    setLoading(true);
    try {
      const code = Math.floor(1000 + Math.random() * 9000).toString();
      const expiresAt = Timestamp.fromDate(new Date(Date.now() + 15 * 60000));
      // 1. Créer la session dans Firestore
      console.log("1. Création session...");
      const sessionRef = await addDoc(collection(db, "attendance_sessions"), {
        trainingId,
        trainingTitle,
        status: "present",
        code,
        active: true,
        expiresAt,
        createdAt: serverTimestamp(),
      });

      console.log("2. Session créée:", sessionRef.id);
      // 2. Récupérer les participants depuis le champ array du document formation
      const formationSnap = await getDoc(doc(db, "formations", trainingId));

      if (!formationSnap.exists()) {
        throw new Error("Formation introuvable.");
      }
      const participantIds = formationSnap.data()?.participants || [];
      console.log(`Participants trouvés: ${participantIds.length}`);

      // 3. Récupérer les tokens Expo de chaque participant
      const tokens = [];
      for (const userId of participantIds) {
        if (!userId) continue;
        const userSnap = await getDoc(doc(db, "users", userId));
        if (!userSnap.exists()) continue;
        const token = userSnap.data()?.expoPushToken;
        if (token) tokens.push(token);
      }

      console.log(`Tokens collectés: ${tokens.length}`);

      // 4. Envoyer la notification groupée
      if (tokens.length > 0) {
        await broadcastNotification(tokens, trainingTitle, code);
      }

      return { code, sessionId: sessionRef.id };
    } catch (err) {
      console.error("Erreur lors de la création de session:", err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // ✅ LEARNER : Valider son code de présence
  // ===============================
  const validateAttendance = async (trainingId, userId, inputCode) => {
    setLoading(true);
    try {
      const q = query(
        collection(db, "attendance_sessions"),
        where("trainingId", "==", trainingId),
        where("code", "==", inputCode),
      );

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        throw new Error("Code incorrect.");
      }

      const sessionDoc = snapshot.docs[0];
      const sessionData = sessionDoc.data();

      if (sessionData.expiresAt.toDate() < new Date()) {
        throw new Error("Le code a expiré.");
      }

      // Enregistrer l'émargement
      await addDoc(collection(db, "attendance"), {
        trainingId,
        userId,
        status: "present",
        timestamp: serverTimestamp(),
        sessionId: sessionDoc.id,
      });

      return { success: true };
    } catch (err) {
      console.error("Erreur validation présence:", err);
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  return { createAttendanceSession, validateAttendance, loading };
}
