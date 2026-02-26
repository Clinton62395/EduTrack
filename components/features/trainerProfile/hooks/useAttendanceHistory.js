import { db } from "@/components/lib/firebase";
import {
    collection,
    doc,
    getDoc,
    onSnapshot,
    orderBy,
    query,
    where,
} from "firebase/firestore";
import { useEffect, useState } from "react";

/**
 * Hook d'historique des présences côté trainer.
 *
 * Firestore :
 * attendance_sessions/ → sessions créées par le trainer
 * attendance/          → validations des apprenants
 * formations/          → participants inscrits
 * users/               → noms des apprenants
 *
 * @param {string} trainingId - Formation sélectionnée
 */
export function useAttendanceHistory(trainingId) {
  const [sessions, setSessions] = useState([]);
  const [attendanceBySession, setAttendanceBySession] = useState({});
  const [learnersMap, setLearnersMap] = useState({}); // { userId: name }
  const [enrolledIds, setEnrolledIds] = useState([]);
  const [loading, setLoading] = useState(true);

  // ─────────────────────────────────────────
  // 📡 SESSIONS DE LA FORMATION
  // ─────────────────────────────────────────
  useEffect(() => {
    if (!trainingId) {
      setSessions([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const q = query(
      collection(db, "attendance_sessions"),
      where("trainingId", "==", trainingId),
      orderBy("createdAt", "desc"),
    );

    const unsub = onSnapshot(q, (snapshot) => {
      setSessions(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });

    return () => unsub();
  }, [trainingId]);

  // ─────────────────────────────────────────
  // 👥 CHARGER LES APPRENANTS INSCRITS + NOMS
  // formations/{trainingId}.participants → users/{userId}.name
  // ─────────────────────────────────────────
  useEffect(() => {
    if (!trainingId) {
      setLearnersMap({});
      setEnrolledIds([]);
      return;
    }

    const loadLearners = async () => {
      try {
        // 1. Récupérer les participants de la formation
        const formationSnap = await getDoc(doc(db, "formations", trainingId));
        const participantIds = formationSnap.data()?.participants || [];

        setEnrolledIds(participantIds);

        if (participantIds.length === 0) return;

        // 2. Charger le nom de chaque apprenant
        const map = {};
        for (const userId of participantIds) {
          const userSnap = await getDoc(doc(db, "users", userId));
          if (userSnap.exists()) {
            map[userId] = userSnap.data()?.name || "Apprenant";
          }
        }
        setLearnersMap(map);
      } catch (error) {
        console.error("Erreur chargement apprenants:", error);
      }
    };

    loadLearners();
  }, [trainingId]);

  // ─────────────────────────────────────────
  // 📡 PRÉSENCES PAR SESSION
  // ─────────────────────────────────────────
  useEffect(() => {
    if (!trainingId || sessions.length === 0) {
      setAttendanceBySession({});
      return;
    }

    const sessionIds = sessions.map((s) => s.id);

    const q = query(
      collection(db, "attendance"),
      where("trainingId", "==", trainingId),
      where("sessionId", "in", sessionIds.slice(0, 30)),
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const map = {};
      snapshot.docs.forEach((d) => {
        const { sessionId, userId, userName } = d.data();
        if (!map[sessionId]) map[sessionId] = [];
        map[sessionId].push({
          userId,
          userName: userName || learnersMap[userId] || "Apprenant",
        });
      });
      setAttendanceBySession(map);
    });

    return () => unsub();
  }, [trainingId, sessions, learnersMap]);

  // ─────────────────────────────────────────
  // 📊 SESSIONS ENRICHIES
  // ─────────────────────────────────────────
  const enrichedSessions = sessions.map((session) => {
    const presentLearners = attendanceBySession[session.id] || [];
    const presentUserIds = presentLearners.map((l) => l.userId);

    // Absents = inscrits qui ne sont pas dans les présents
    const absentLearners = enrolledIds
      .filter((id) => !presentUserIds.includes(id))
      .map((id) => ({
        userId: id,
        userName: learnersMap[id] || "Apprenant",
      }));

    return {
      ...session,
      presentLearners,
      absentLearners,
      presentCount: presentLearners.length,
      absentCount: absentLearners.length,
      totalCount: enrolledIds.length,
    };
  });

  return {
    sessions: enrichedSessions,
    loading,
  };
}
