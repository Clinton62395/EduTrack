import { db } from "@/components/lib/firebase";
import {
  collection,
  getDocs,
  onSnapshot,
  query,
  where,
} from "@react-native-firebase/firestore";
import { useEffect, useState } from "react";

// ─────────────────────────────────────────
// 🛠️ UTILITAIRE : Chunking pour limite Firestore "in" (30)
// ─────────────────────────────────────────
const chunkArray = (array, size) => {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

// ─────────────────────────────────────────
// 📊 useTrainerProgress
// ─────────────────────────────────────────
export function useTrainerProgress(trainerId) {
  const [formationsProgress, setFormationsProgress] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!trainerId) {
      setLoading(false);
      return;
    }

    const unsub = onSnapshot(
      query(collection(db, "formations"), where("trainerId", "==", trainerId)),
      async (snapshot) => {
        if (snapshot.empty) {
          setFormationsProgress([]);
          setLoading(false);
          return;
        }

        const formations = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));

        try {
          const enriched = await Promise.all(
            formations.map((f) => enrichFormationProgress(f)),
          );
          setFormationsProgress(enriched);
        } catch (err) {
          console.error("Erreur enrichissement:", err);
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        console.error("Erreur Snapshot:", error);
        setLoading(false);
      },
    );

    return () => unsub();
  }, [trainerId]);

  return { formationsProgress, loading };
}

// ─────────────────────────────────────────
// 🔧 ENRICHISSEMENT (Stats par formation)
// ─────────────────────────────────────────
async function enrichFormationProgress(formation) {
  try {
    const participantIds = (formation.participants || []).map((p) =>
      typeof p === "string" ? p : p.uid,
    );

    if (participantIds.length === 0) {
      return {
        ...formation,
        totalLearners: 0,
        avgCompletion: 0,
        certifiedCount: 0,
        learners: [],
      };
    }

    // 1️⃣ Total des leçons
    const modulesSnap = await getDocs(
      collection(db, "formations", formation.id, "modules"),
    );

    const allLessonsSnaps = await Promise.all(
      modulesSnap.docs.map((m) =>
        getDocs(
          collection(
            db,
            "formations",
            formation.id,
            "modules",
            m.id,
            "lessons",
          ),
        ),
      ),
    );

    const totalLessons = allLessonsSnaps.reduce(
      (acc, snap) => acc + snap.size,
      0,
    );

    // 2️⃣ Données croisées en parallèle
    const [progressSnap, quizSnap, certsSnap] = await Promise.all([
      getDocs(
        query(
          collection(db, "userProgress"),
          where("trainingId", "==", formation.id),
        ),
      ),
      getDocs(
        query(
          collection(db, "quizResults"),
          where("trainingId", "==", formation.id),
          where("passed", "==", true),
        ),
      ),
      getDocs(
        query(
          collection(db, "certificates"),
          where("trainingId", "==", formation.id),
        ),
      ),
    ]);

    // Indexation O(1)
    const completedByUser = {};
    progressSnap.docs.forEach((d) => {
      const { userId, lessonId } = d.data();
      if (!completedByUser[userId]) completedByUser[userId] = [];
      completedByUser[userId].push(lessonId);
    });

    const quizPassedUserIds = new Set(
      quizSnap.docs.map((d) => d.data().userId),
    );
    const certifiedUserIds = new Set(
      certsSnap.docs.map((d) => d.data().userId),
    );

    // 3️⃣ Profils utilisateurs (chunking 30)
    const learnersData = {};
    const userSnaps = await Promise.all(
      chunkArray(participantIds, 30).map((chunk) =>
        getDocs(query(collection(db, "users"), where("__name__", "in", chunk))),
      ),
    );
    userSnaps.forEach((snap) => {
      snap.docs.forEach((d) => {
        learnersData[d.id] = d.data();
      });
    });

    // 4️⃣ Calcul par apprenant
    const learnersProgress = participantIds.map((userId) => {
      const userData = learnersData[userId] || {};
      const completedCount = (completedByUser[userId] || []).length;
      const completionPercent =
        totalLessons > 0
          ? Math.round((completedCount / totalLessons) * 100)
          : 0;

      return {
        userId,
        name: userData.name || "Apprenant",
        photoURL: userData.photoURL || null,
        lessonsCompleted: completedCount,
        totalLessons,
        completionPercent,
        quizPassed: quizPassedUserIds.has(userId),
        certified: certifiedUserIds.has(userId),
      };
    });

    // 5️⃣ Stats globales
    const avgCompletion =
      learnersProgress.length > 0
        ? Math.round(
            learnersProgress.reduce((acc, l) => acc + l.completionPercent, 0) /
              learnersProgress.length,
          )
        : 0;

    return {
      ...formation,
      totalLearners: participantIds.length,
      totalLessons,
      avgCompletion,
      certifiedCount: certifiedUserIds.size,
      learners: learnersProgress.sort(
        (a, b) => b.completionPercent - a.completionPercent,
      ),
    };
  } catch (error) {
    console.error("Erreur enrichissement formation:", error);
    return {
      ...formation,
      totalLearners: 0,
      avgCompletion: 0,
      certifiedCount: 0,
      learners: [],
    };
  }
}
