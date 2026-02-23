import { db } from "@/components/lib/firebase";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useRef, useState } from "react";

export function useLearnerAttendance(userId, enrolledTrainingIds = []) {
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Ref pour accéder à l'historique dans le listener de session
  const historyRef = useRef([]);

  useEffect(() => {
    if (!userId || !enrolledTrainingIds || enrolledTrainingIds.length === 0) {
      setLoading(false);
      setActiveSession(null);
      return;
    }

    // ─────────────────────────────────────────
    // 1. Historique des présences
    // ─────────────────────────────────────────
    const qHistory = query(
      collection(db, "attendance"),
      where("userId", "==", userId),
    );

    const unsubHistory = onSnapshot(qHistory, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      const sorted = data.sort(
        (a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0),
      );

      // ✅ Mettre à jour la ref ET le state
      historyRef.current = sorted;
      setAttendanceHistory(sorted);
      setLoading(false);
    });

    // ─────────────────────────────────────────
    // 2. Sessions actives
    // ─────────────────────────────────────────
    const qSession = query(
      collection(db, "attendance_sessions"),
      where("trainingId", "in", enrolledTrainingIds),
      where("active", "==", true),
    );

    const unsubSession = onSnapshot(qSession, (snapshot) => {
      if (!snapshot.empty) {
        const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        const latestSession = docs.sort(
          (a, b) => b.createdAt?.seconds - a.createdAt?.seconds,
        )[0];

        const now = new Date();
        const notExpired =
          latestSession.expiresAt?.toDate() > new Date(now.getTime() - 60000);

        if (notExpired) {
          // ✅ Vérifier si l'apprenant a déjà validé cette session
          const alreadyValidated = historyRef.current.some(
            (a) => a.sessionId === latestSession.id,
          );

          setActiveSession(alreadyValidated ? null : latestSession);
        } else {
          setActiveSession(null);
        }
      } else {
        setActiveSession(null);
      }
    });

    return () => {
      unsubHistory();
      unsubSession();
    };
  }, [userId, JSON.stringify(enrolledTrainingIds)]);

  return { attendanceHistory, activeSession, loading };
}
