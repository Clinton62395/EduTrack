import { db } from "@/components/lib/firebase";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  where
} from "@react-native-firebase/firestore";
import { useEffect, useState } from "react";

export function useAttendanceHistory(trainingId) {
  const [sessions, setSessions] = useState([]);
  const [attendanceBySession, setAttendanceBySession] = useState({});
  const [learnersMap, setLearnersMap] = useState({});
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

    const unsub = onSnapshot(
      query(
        collection(db, "attendance_sessions"),
        where("trainingId", "==", trainingId),
        orderBy("createdAt", "desc"),
      ),
      (snapshot) => {
        setSessions(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
    );

    return () => unsub();
  }, [trainingId]);

  // ─────────────────────────────────────────
  // 👥 APPRENANTS INSCRITS + NOMS
  // ─────────────────────────────────────────
  useEffect(() => {
    if (!trainingId) {
      setLearnersMap({});
      setEnrolledIds([]);
      return;
    }

    const loadLearners = async () => {
      try {
        // 1. Participants de la formation
        const formationSnap = await getDoc(doc(db, "formations", trainingId));
        const participants = formationSnap.data()?.participants || [];

        // participants peut être un tableau d'objets {uid, name} ou de strings
        // On gère les deux cas
        const ids = participants.map((p) =>
          typeof p === "string" ? p : p.uid,
        );

        setEnrolledIds(ids);
        if (ids.length === 0) return;

        // 2. Noms des apprenants en parallèle
        const userSnaps = await Promise.all(
          ids.map((id) => getDoc(doc(db, "users", id))),
        );

        const map = {};
        userSnaps.forEach((snap, i) => {
          if (snap.exists()) {
            map[ids[i]] = snap.data()?.name || "Apprenant";
          }
        });

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

    // Firestore "in" limite à 30 valeurs
    const sessionIds = sessions.map((s) => s.id).slice(0, 30);

    const unsub = onSnapshot(
      query(
        collection(db, "attendance"),
        where("trainingId", "==", trainingId),
        where("sessionId", "in", sessionIds),
      ),
      (snapshot) => {
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
      },
    );

    return () => unsub();
  }, [trainingId, sessions, learnersMap]);

  // ─────────────────────────────────────────
  // 📊 SESSIONS ENRICHIES
  // ─────────────────────────────────────────
  const enrichedSessions = sessions.map((session) => {
    const presentLearners = attendanceBySession[session.id] || [];
    const presentUserIds = presentLearners.map((l) => l.userId);

    const absentLearners = enrolledIds
      .filter((id) => !presentUserIds.includes(id))
      .map((id) => ({ userId: id, userName: learnersMap[id] || "Apprenant" }));

    return {
      ...session,
      presentLearners,
      absentLearners,
      presentCount: presentLearners.length,
      absentCount: absentLearners.length,
      totalCount: enrolledIds.length,
    };
  });

  return { sessions: enrichedSessions, loading };
}
