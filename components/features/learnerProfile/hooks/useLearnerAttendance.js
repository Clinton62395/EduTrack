import { db } from "@/components/lib/firebase";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";

export function useLearnerAttendance(userId, trainingId) {
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    // 1. Écouter l'historique des présences
    const qHistory = query(
      collection(db, "attendance"),
      where("userId", "==", userId),
    );

    const unsubHistory = onSnapshot(qHistory, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setAttendanceHistory(
        data.sort((a, b) => b.timestamp?.seconds - a.timestamp?.seconds),
      );
      setLoading(false);
    });

    // 2. Écouter s'il y a une session de présence active pour cette formation
    let unsubSession = () => {};
    if (trainingId) {
      const qSession = query(
        collection(db, "attendance_sessions"),
        where("trainingId", "==", trainingId),
        where("active", "==", true),
      );

      unsubSession = onSnapshot(qSession, (snapshot) => {
        if (!snapshot.empty) {
          const sessionData = snapshot.docs[0].data();
          // Vérifier si elle n'est pas expirée
          if (sessionData.expiresAt?.toDate() > new Date()) {
            setActiveSession({ id: snapshot.docs[0].id, ...sessionData });
          } else {
            setActiveSession(null);
          }
        } else {
          setActiveSession(null);
        }
      });
    }

    return () => {
      unsubHistory();
      unsubSession();
    };
  }, [userId, trainingId]);

  return { attendanceHistory, activeSession, loading };
}
