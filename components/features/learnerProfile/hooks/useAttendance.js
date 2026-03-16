import { db } from "@/components/lib/firebase";
import {
  Timestamp,
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from "@react-native-firebase/firestore";
import { useState } from "react";
import { broadcastNotification } from "../../../helpers/useNotificationforLearnerAttendance";

export function useAttendance() {
  const [loading, setLoading] = useState(false);

  // ─────────────────────────────────────────
  // 🎟️ CRÉER UNE SESSION (Trainer)
  // ─────────────────────────────────────────
  const createAttendanceSession = async (
    trainingId,
    trainingTitle,
    trainerId,
  ) => {
    setLoading(true);
    try {
      // 1. Désactiver les anciennes sessions actives
      const oldSnap = await getDocs(
        query(
          collection(db, "attendance_sessions"),
          where("trainingId", "==", trainingId),
          where("active", "==", true),
        ),
      );

      if (!oldSnap.empty) {
        const batch = writeBatch(db);
        oldSnap.docs.forEach((d) => {
          batch.update(doc(db, "attendance_sessions", d.id), {
            active: false,
            closedAt: serverTimestamp(),
          });
        });
        await batch.commit();
      }

      // 2. Générer code + expiration
      const code = Math.floor(1000 + Math.random() * 9000).toString();
      const expiresAt = Timestamp.fromDate(new Date(Date.now() + 15 * 60000));

      const sessionData = {
        trainingId,
        trainingTitle,
        trainerId, // ✅ passé en paramètre — plus fiable
        code,
        active: true,
        expiresAt,
        createdAt: serverTimestamp(),
      };

      const sessionRef = await addDoc(
        collection(db, "attendance_sessions"),
        sessionData,
      );

      // 3. Notification Push
      const formationSnap = await getDoc(doc(db, "formations", trainingId));
      const participantIds = formationSnap.data()?.participants || [];

      // ✅ participants = strings UIDs — on récupère les tokens depuis users
      if (participantIds.length > 0) {
        const chunks = [];
        for (let i = 0; i < participantIds.length; i += 30) {
          chunks.push(participantIds.slice(i, i + 30));
        }

        const userSnaps = await Promise.all(
          chunks.map((chunk) =>
            getDocs(
              query(collection(db, "users"), where("__name__", "in", chunk)),
            ),
          ),
        );

        const tokens = userSnaps
          .flatMap((snap) => snap.docs)
          .flatMap((d) => d.data().pushTokens || [])
          .filter(Boolean);

        if (tokens.length > 0) {
          broadcastNotification(tokens, trainingTitle, code).catch(
            console.error,
          );
        }
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
      // 1. Recherche session active
      const snapshot = await getDocs(
        query(
          collection(db, "attendance_sessions"),
          where("trainingId", "==", trainingId),
          where("code", "==", inputCode.toString().trim()),
          where("active", "==", true),
        ),
      );

      if (snapshot.empty) {
        throw new Error("Code incorrect ou session expirée.");
      }

      const sessionDoc = snapshot.docs[0];
      const sessionData = sessionDoc.data();

      // 2. Vérification temporelle
      if (sessionData.expiresAt.toDate() < new Date()) {
        await updateDoc(doc(db, "attendance_sessions", sessionDoc.id), {
          active: false,
        });
        throw new Error("Le code a expiré.");
      }

      // 3. Enregistrement présence (ID prédictif anti double-pointage)
      const attendanceId = `${sessionDoc.id}_${userId}`;
      await setDoc(
        doc(db, "attendance", attendanceId),
        {
          trainingId,
          trainingTitle: trainingTitle || sessionData.trainingTitle,
          userId,
          userName: userName || "Apprenant",
          status: "present",
          timestamp: serverTimestamp(),
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
