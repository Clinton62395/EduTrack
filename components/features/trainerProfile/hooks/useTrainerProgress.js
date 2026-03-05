import { db } from "@/components/lib/firebase";
import { onSnapshot } from "@react-native-firebase/firestore";
import { useEffect, useState } from "react";
// firestore via db methods

/**
 * ═══════════════════════════════════════════════════════
 * 📊 useTrainerProgress
 * ═══════════════════════════════════════════════════════
 *
 * Ce hook calcule la progression de TOUS les apprenants
 * pour TOUTES les formations d'un trainer.
 *
 * Structure des données retournées :
 * [
 *   {
 *     id: "formationId",
 *     title: "Formation React Native",
 *     totalLearners: 10,
 *     avgCompletion: 65,        ← % moyen de leçons complétées
 *     certifiedCount: 3,        ← nb de certificats délivrés
 *     learners: [
 *       {
 *         userId: "abc",
 *         name: "Jean Dupont",
 *         lessonsCompleted: 8,
 *         totalLessons: 12,
 *         completionPercent: 67,
 *         quizPassed: true,
 *         certified: false,
 *       }
 *     ]
 *   }
 * ]
 *
 * @param {string} trainerId - UID du trainer connecté
 */
export function useTrainerProgress(trainerId) {
  // ── État principal : tableau de formations enrichies ──
  const [formationsProgress, setFormationsProgress] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!trainerId) {
      setLoading(false);
      return;
    }

    // ─────────────────────────────────────────────────────
    // 📡 ÉTAPE 1 : Écouter les formations du trainer
    // On utilise onSnapshot pour avoir les mises à jour
    // en temps réel si une nouvelle formation est créée
    // ─────────────────────────────────────────────────────
    const formationsQuery = db
      .collection("formations")
      .where("trainerId", "==", trainerId);

    const unsubscribe = onSnapshot(formationsQuery, async (snapshot) => {
      const formations = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      if (formations.length === 0) {
        setFormationsProgress([]);
        setLoading(false);
        return;
      }

      // ─────────────────────────────────────────────────
      // 🔄 ÉTAPE 2 : Pour chaque formation, calculer
      // la progression de chaque apprenant inscrit
      // ─────────────────────────────────────────────────
      const enriched = await Promise.all(
        formations.map((formation) => enrichFormationProgress(formation)),
      );

      setFormationsProgress(enriched);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [trainerId]);

  return { formationsProgress, loading };
}

// ═══════════════════════════════════════════════════════
// 🔧 FONCTION UTILITAIRE : enrichFormationProgress
// Calcule toutes les stats d'une formation
// ═══════════════════════════════════════════════════════
async function enrichFormationProgress(formation) {
  try {
    // ── Liste des apprenants inscrits ──
    // On récupère le tableau "participants" stocké dans le doc formation
    const participantIds = formation.participants || [];

    if (participantIds.length === 0) {
      // Pas d'apprenants → on retourne la formation avec des stats vides
      return {
        ...formation,
        totalLearners: 0,
        avgCompletion: 0,
        certifiedCount: 0,
        learners: [],
      };
    }

    // ─────────────────────────────────────────────────
    // 📚 ÉTAPE A : Compter le total de leçons
    // dans tous les modules de cette formation
    // ─────────────────────────────────────────────────
    const modulesSnap = await db
      .collection("formations")
      .doc(formation.id)
      .collection("modules")
      .get();
    const modules = modulesSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

    // Pour chaque module, on compte ses leçons
    let totalLessons = 0;
    for (const module of modules) {
      const lessonsSnap = await db
        .collection("formations")
        .doc(formation.id)
        .collection("modules")
        .doc(module.id)
        .collection("lessons")
        .get();
      totalLessons += lessonsSnap.size;
    }

    // ─────────────────────────────────────────────────
    // ✅ ÉTAPE B : Récupérer toutes les leçons
    // complétées pour cette formation (tous apprenants)
    // ─────────────────────────────────────────────────
    const progressSnap = await db
      .collection("userProgress")
      .where("trainingId", "==", formation.id)
      .get();

    // On groupe les leçons complétées par userId
    // Résultat : { "userId1": ["lessonId1", "lessonId2"], "userId2": [...] }
    const completedByUser = {};
    progressSnap.docs.forEach((d) => {
      const { userId, lessonId } = d.data();
      if (!completedByUser[userId]) completedByUser[userId] = [];
      completedByUser[userId].push(lessonId);
    });

    // ─────────────────────────────────────────────────
    // 🏆 ÉTAPE C : Récupérer les quiz réussis
    // pour cette formation (tous apprenants)
    // ─────────────────────────────────────────────────
    const quizSnap = await db
      .collection("quizResults")
      .where("trainingId", "==", formation.id)
      .where("passed", "==", true)
      .get();

    // On stocke les userId qui ont réussi AU MOINS un quiz
    // dans cette formation
    const quizPassedUserIds = new Set(
      quizSnap.docs.map((d) => d.data().userId),
    );

    // ─────────────────────────────────────────────────
    // 🎓 ÉTAPE D : Récupérer les certificats délivrés
    // pour cette formation
    // ─────────────────────────────────────────────────
    const certsSnap = await db
      .collection("certificates")
      .where("trainingId", "==", formation.id)
      .get();

    // Set des userId certifiés pour accès rapide
    const certifiedUserIds = new Set(
      certsSnap.docs.map((d) => d.data().userId),
    );

    // ─────────────────────────────────────────────────
    // 👥 ÉTAPE E : Charger les infos de chaque apprenant
    // et calculer sa progression individuelle
    // ─────────────────────────────────────────────────
    const learnersProgress = await Promise.all(
      participantIds.map(async (userId) => {
        // Charger le profil de l'apprenant depuis "users"
        const userSnap = await getDoc(doc(db, "users", userId));
        const userData = userSnap.exists() ? userSnap.data() : {};

        // Leçons complétées par cet apprenant
        const completedLessons = completedByUser[userId] || [];
        const lessonsCompleted = completedLessons.length;

        // Calcul du pourcentage de complétion
        // Ex: 8 leçons complétées / 12 total = 67%
        const completionPercent =
          totalLessons > 0
            ? Math.round((lessonsCompleted / totalLessons) * 100)
            : 0;

        return {
          userId,
          name: userData.name || "Apprenant",
          photoURL: userData.photoURL || null,
          lessonsCompleted,
          totalLessons,
          completionPercent,
          // true si l'apprenant a réussi au moins un quiz
          quizPassed: quizPassedUserIds.has(userId),
          // true si le certificat a été délivré
          certified: certifiedUserIds.has(userId),
        };
      }),
    );

    // ─────────────────────────────────────────────────
    // 📊 ÉTAPE F : Calculer les stats globales
    // de la formation
    // ─────────────────────────────────────────────────

    // Moyenne des % de complétion de tous les apprenants
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
      // Triés par % décroissant — les plus avancés en premier
      learners: learnersProgress.sort(
        (a, b) => b.completionPercent - a.completionPercent,
      ),
    };
  } catch (error) {
    console.error("Erreur enrichissement formation:", error);
    // En cas d'erreur, on retourne la formation sans stats
    return {
      ...formation,
      totalLearners: 0,
      avgCompletion: 0,
      certifiedCount: 0,
      learners: [],
    };
  }
}
