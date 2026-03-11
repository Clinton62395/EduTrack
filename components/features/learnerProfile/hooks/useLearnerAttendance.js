import { db } from "@/components/lib/firebase";
import {
  collection,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  where,
} from "@react-native-firebase/firestore";
import { useEffect, useState } from "react";

export function useLearnerAttendance(userId, enrolledTrainingIds = []) {
  const [fullHistory, setFullHistory] = useState([]);
  const [stats, setStats] = useState({ present: 0, absent: 0, rate: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId || enrolledTrainingIds.length === 0) {
      setLoading(false);
      return;
    }

    // ✅ Firestore "in" limite à 30
    const trainingChunks = [];
    for (let i = 0; i < enrolledTrainingIds.length; i += 30) {
      trainingChunks.push(enrolledTrainingIds.slice(i, i + 30));
    }

    // 1. Écoute des émargements de l'élève
    const unsub = onSnapshot(
      query(collection(db, "attendance"), where("userId", "==", userId)),
      async (attSnapshot) => {
        const attendanceRecords = attSnapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));

        // 2. Sessions des formations suivies (chunks de 30)
        const sessionSnaps = await Promise.all(
          trainingChunks.map((chunk) =>
            getDocs(
              query(
                collection(db, "attendance_sessions"),
                where("trainingId", "in", chunk),
                orderBy("createdAt", "desc"),
              ),
            ),
          ),
        );

        const allSessions = sessionSnaps
          .flatMap((snap) => snap.docs)
          .map((d) => ({ id: d.id, ...d.data() }));

        // 3. Calcul présent / absent / en cours
        const computed = allSessions.map((session) => {
          const isPresent = attendanceRecords.find(
            (r) => r.sessionId === session.id,
          );
          const isExpired = session.expiresAt?.toDate() < new Date();

          let status = "absent";
          if (isPresent) status = "present";
          else if (session.active && !isExpired) status = "active";

          return {
            id: session.id,
            title: session.trainingTitle || "Session de cours",
            date: session.createdAt?.toDate(),
            status,
            trainingId: session.trainingId,
          };
        });

        // 4. Stats
        const p = computed.filter((h) => h.status === "present").length;
        const a = computed.filter((h) => h.status === "absent").length;

        setStats({
          present: p,
          absent: a,
          rate: p + a > 0 ? Math.round((p / (p + a)) * 100) : 100,
        });

        setFullHistory(computed);
        setLoading(false);
      },
    );

    return () => unsub();
  }, [userId, enrolledTrainingIds.length]);

  return { fullHistory, stats, loading };
}
