import { db } from "@/components/lib/firebase"; // Instance firestore() native
import firestore from "@react-native-firebase/firestore"; // Pour les utilitaires statiques
import { useEffect, useState } from "react";

export function useQuiz(formationId, moduleId) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // ── Snack feedback ──
  const [snack, setSnack] = useState({
    visible: false,
    message: "",
    type: "success",
  });
  const showSnack = (message, type = "success") =>
    setSnack({ visible: true, message, type });
  const dismissSnack = () => setSnack((prev) => ({ ...prev, visible: false }));

  // ── Helpers de chemins (Clean & Native) ──
  const getQuizRef = () =>
    db
      .collection("formations")
      .doc(formationId)
      .collection("modules")
      .doc(moduleId)
      .collection("quiz");

  // ─────────────────────────────────────────
  // 📡 ÉCOUTE TEMPS RÉEL (Syntaxe Native)
  // ─────────────────────────────────────────
  useEffect(() => {
    if (!formationId || !moduleId) {
      setQuestions([]);
      setLoading(false);
      return;
    }

    const unsubscribe = getQuizRef()
      .orderBy("order", "asc")
      .onSnapshot(
        (snapshot) => {
          const data = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setQuestions(data);
          setLoading(false);
        },
        (error) => {
          console.error("Erreur Quiz Native:", error);
          showSnack("Erreur lors du chargement", "error");
          setLoading(false);
        },
      );

    return () => unsubscribe();
  }, [formationId, moduleId]);

  // ─────────────────────────────────────────
  // ➕ AJOUTER / ✏️ MODIFIER / 🗑️ SUPPRIMER
  // ─────────────────────────────────────────
  const addQuestion = async (questionData) => {
    if (!questionData.question?.trim())
      return showSnack("Question requise", "error");
    try {
      setActionLoading(true);
      await getQuizRef().add({
        ...questionData,
        order: questions.length + 1,
        createdAt: firestore.FieldValue.serverTimestamp(),
      });
      showSnack("Question ajoutée");
    } finally {
      setActionLoading(false);
    }
  };

  const updateQuestion = async (questionId, updatedData) => {
    try {
      setActionLoading(true);
      await getQuizRef()
        .doc(questionId)
        .update({
          ...updatedData,
          updatedAt: firestore.FieldValue.serverTimestamp(),
        });
      showSnack("Question modifiée");
    } finally {
      setActionLoading(false);
    }
  };

  const deleteQuestion = async (questionId) => {
    try {
      setActionLoading(true);
      const batch = firestore().batch();
      batch.delete(getQuizRef().doc(questionId));

      const remaining = questions.filter((q) => q.id !== questionId);
      remaining.forEach((q, index) => {
        batch.update(getQuizRef().doc(q.id), { order: index + 1 });
      });

      await batch.commit();
      showSnack("Question supprimée");
    } finally {
      setActionLoading(false);
    }
  };

  // ─────────────────────────────────────────
  // 📊 SOUMETTRE LES RÉPONSES (Learner)
  // ─────────────────────────────────────────
  const submitQuiz = async (
    userId,
    trainingId,
    userAnswers,
    passingScore = 70,
  ) => {
    try {
      setActionLoading(true);

      // 1. Calcul du score
      let score = 0;
      const totalPoints = questions.reduce(
        (acc, q) => acc + (q.points || 1),
        0,
      );
      questions.forEach((q, i) => {
        if (userAnswers[i] === q.correctIndex) score += q.points || 1;
      });

      const percentage = Math.round((score / totalPoints) * 100);
      const passed = percentage >= passingScore;

      // 2. Récupération des tentatives (Atomicité avec increment)
      const resultId = `${userId}_${moduleId}`;
      const resultRef = db.collection("quizResults").doc(resultId);
      const resultSnap = await resultRef.get();

      const attempts = resultSnap.exists
        ? (resultSnap.data().attempts || 0) + 1
        : 1;

      // 3. Sauvegarde (Utilisation de .set avec merge pour garder l'historique)
      await resultRef.set(
        {
          userId,
          moduleId,
          trainingId,
          score,
          totalPoints,
          percentage,
          passed,
          attempts,
          userAnswers,
          completedAt: firestore.FieldValue.serverTimestamp(),
        },
        { merge: true },
      );

      // 4. Si réussi, on met à jour le progrès global
      if (passed) {
        // On utilise un ID prévisible pour éviter les doublons dans userProgress
        await db
          .collection("userProgress")
          .doc(`${userId}_quiz_${moduleId}`)
          .set({
            userId,
            trainingId,
            moduleId,
            lessonId: `quiz_${moduleId}`,
            completedAt: firestore.FieldValue.serverTimestamp(),
          });
      }

      return { score, totalPoints, percentage, passed, attempts };
    } catch (error) {
      console.error("Submit Quiz Error:", error);
      showSnack("Erreur lors de la soumission", "error");
      return null;
    } finally {
      setActionLoading(false);
    }
  };

  return {
    questions,
    loading,
    actionLoading,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    submitQuiz,
    snack,
    dismissSnack,
  };
}
