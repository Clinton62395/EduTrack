import { db } from "@/components/lib/firebase"; // Ton instance firestore() native
import { useEffect, useState } from "react";

/**
 * 🛠️ FONCTION UTILITAIRE : Découper un tableau pour contourner la limite Firestore 'in' (30)
 */
const chunkArray = (array, size) => {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

/**
 * 📊 useTrainerProgress
 * Version Native, optimisée pour le Offline et les grands groupes d'apprenants.
 */
export function useTrainerProgress(trainerId) {
  const [formationsProgress, setFormationsProgress] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!trainerId) {
      setLoading(false);
      return;
    }

    // 📡 ÉCOUTE TEMPS RÉEL des formations du trainer
    const unsubscribe = db
      .collection("formations")
      .where("trainerId", "==", trainerId)
      .onSnapshot(
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

          // 🔄 Enrichissement de chaque formation en parallèle
          try {
            const enriched = await Promise.all(
              formations.map((f) => enrichFormationProgress(f)),
            );
            setFormationsProgress(enriched);
          } catch (err) {
            console.error("Erreur lors de l'enrichissement:", err);
          } finally {
            setLoading(false);
          }
        },
        (error) => {
          console.error("Erreur Snapshot Firebase:", error);
          setLoading(false);
        },
      );

    return () => unsubscribe();
  }, [trainerId]);

  return { formationsProgress, loading };
}

/**
 * 🔧 LOGIQUE D'ENRICHISSEMENT (Calcul des stats)
 */
async function enrichFormationProgress(formation) {
  try {
    const participantIds = formation.participants || [];
    if (participantIds.length === 0) {
      return {
        ...formation,
        totalLearners: 0,
        avgCompletion: 0,
        certifiedCount: 0,
        learners: [],
      };
    }

    // 1️⃣ RÉCUPÉRATION DU TOTAL DE LEÇONS
    const modulesSnap = await db
      .collection("formations")
      .doc(formation.id)
      .collection("modules")
      .get();

    const lessonsQueries = modulesSnap.docs.map((m) =>
      db
        .collection("formations")
        .doc(formation.id)
        .collection("modules")
        .doc(m.id)
        .collection("lessons")
        .get(),
    );
    const allLessonsSnaps = await Promise.all(lessonsQueries);
    const totalLessons = allLessonsSnaps.reduce(
      (acc, snap) => acc + snap.size,
      0,
    );

    // 2️⃣ RÉCUPÉRATION DES DONNÉES CROISÉES (Progrès, Quiz, Certifs)
    const [progressSnap, quizSnap, certsSnap] = await Promise.all([
      db
        .collection("userProgress")
        .where("trainingId", "==", formation.id)
        .get(),
      db
        .collection("quizResults")
        .where("trainingId", "==", formation.id)
        .where("passed", "==", true)
        .get(),
      db
        .collection("certificates")
        .where("trainingId", "==", formation.id)
        .get(),
    ]);

    // Indexation pour accès rapide (O(1))
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

    // 3️⃣ CHARGEMENT DES PROFILS UTILISATEURS (Gestion du chunking > 30)
    let learnersData = {};
    const participantChunks = chunkArray(participantIds, 30);

    const userQueries = participantChunks.map((batchIds) =>
      db.collection("users").where("__name__", "in", batchIds).get(),
    );

    const userSnaps = await Promise.all(userQueries);
    userSnaps.forEach((snap) => {
      snap.docs.forEach((d) => {
        learnersData[d.id] = d.data();
      });
    });

    // 4️⃣ CALCUL FINAL PAR APPRENANT
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

    // 5️⃣ STATS GLOBALES
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
