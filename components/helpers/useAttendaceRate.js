import { db } from "@/components/lib/firebase";
import {
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "@react-native-firebase/firestore";

// ─────────────────────────────────────────
// 📊 TAUX DE PRÉSENCE — CÔTÉ TRAINER
//
// Calcule le taux moyen de présence de tous
// les élèves sur toutes les formations du trainer.
//
// Formule :
//   rate = (total présences / total sessions × élèves) × 100
//
// Appelé dans TrainerAttendanceControl après
// chaque clôture de session.
// ─────────────────────────────────────────
export async function recalculateTrainerAttendanceRate(trainerId) {
  if (!trainerId) return;

  try {
    // 1. Toutes les sessions des formations du trainer
    const sessionsSnap = await getDocs(
      query(
        collection(db, "attendance_sessions"),
        where("trainerId", "==", trainerId),
      ),
    );

    // Uniquement les sessions clôturées
    const closedSessions = sessionsSnap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((s) => !s.active);

    if (closedSessions.length === 0) {
      await updateDoc(doc(db, "users", trainerId), {
        attendanceRate: 0,
        attendanceStats: {
          totalSessions: 0,
          totalPresences: 0,
          updatedAt: serverTimestamp(),
        },
      });
      return 0;
    }

    // 2. Toutes les présences enregistrées sur ces sessions
    const sessionIds = closedSessions.map((s) => s.id);

    // Chunking à 30 — limite Firestore "in"
    const chunks = [];
    for (let i = 0; i < sessionIds.length; i += 30) {
      chunks.push(sessionIds.slice(i, i + 30));
    }

    const attendanceSnaps = await Promise.all(
      chunks.map((chunk) =>
        getDocs(
          query(collection(db, "attendance"), where("sessionId", "in", chunk)),
        ),
      ),
    );

    const totalPresences = attendanceSnaps.reduce(
      (acc, snap) => acc + snap.size,
      0,
    );

    // 3. Nombre total d'élèves × sessions
    // Pour chaque session clôturée, on compte les participants
    // de la formation au moment de la session
    const formationsSnap = await getDocs(
      query(collection(db, "formations"), where("trainerId", "==", trainerId)),
    );

    // Map formationId → nombre de participants
    const participantsMap = {};
    formationsSnap.docs.forEach((d) => {
      participantsMap[d.id] = (d.data().participants || []).length;
    });

    // Total théorique = somme des participants par session
    const totalTheoretical = closedSessions.reduce((acc, session) => {
      const count = participantsMap[session.trainingId] || 0;
      return acc + count;
    }, 0);

    // 4. Calcul du taux
    const rate =
      totalTheoretical > 0
        ? Math.round((totalPresences / totalTheoretical) * 100)
        : 0;

    // 5. Sauvegarde dans le profil trainer
    await updateDoc(doc(db, "users", trainerId), {
      attendanceRate: rate,
      attendanceStats: {
        totalSessions: closedSessions.length,
        totalPresences,
        totalTheoretical,
        updatedAt: serverTimestamp(),
      },
    });

    return rate;
  } catch (error) {
    console.error("Erreur recalculateTrainerAttendanceRate:", error);
  }
}
