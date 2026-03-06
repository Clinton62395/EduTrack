import { db } from "@/components/lib/firebase";
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

    // 1. Écouter les émargements de l'élève
    const unsub = db
      .collection("attendance")
      .where("userId", "==", userId)
      .onSnapshot(async (attSnapshot) => {
        const attendanceRecords = attSnapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));

        // 2. Récupérer les sessions des formations suivies
        const sessionsSnapshot = await db
          .collection("attendance_sessions")
          .where("trainingId", "in", enrolledTrainingIds)
          .orderBy("createdAt", "desc")
          .get();

        const allSessions = sessionsSnapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));

        // 3. Calcul de l'état (Présent / Absent / En cours)
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
            status: status,
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
      });

    return () => unsub();
  }, [userId, enrolledTrainingIds.length]);

  return { fullHistory, stats, loading };
}
