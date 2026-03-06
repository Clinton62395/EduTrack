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
  // 📊 SOUMETTRE LES RÉPONSES
  const submitQuiz = async (
    userId,
    trainingId,
    userAnswers,
    passingScore = 70,
  ) => {
    try {
      setActionLoading(true);

      // 1. Calcul du score (On garde ta logique très claire)
      let score = 0;
      const totalPoints = questions.reduce(
        (acc, q) => acc + (q.points || 1),
        0,
      );

      questions.forEach((q, i) => {
        // userAnswers peut être un objet { [questionId]: index } pour plus de sécurité
        if (userAnswers[i] === q.correctIndex) score += q.points || 1;
      });

      const percentage =
        totalPoints > 0 ? Math.round((score / totalPoints) * 100) : 0;
      const passed = percentage >= passingScore;

      // 2. Préparation des références
      const resultId = `${userId}_${moduleId}`;
      const resultRef = db.collection("quizResults").doc(resultId);
      const progressRef = db
        .collection("userProgress")
        .doc(`${userId}_quiz_${moduleId}`);

      // 3. EXECUTION EN TRANSACTION (Garantit l'atomicité du score et du progrès)
      const finalResult = await db.runTransaction(async (transaction) => {
        const resultSnap = await transaction.get(resultRef);
        const currentAttempts = resultSnap.exists
          ? resultSnap.data().attempts || 0
          : 0;

        // Mise à jour du résultat du Quiz
        transaction.set(
          resultRef,
          {
            userId,
            moduleId,
            trainingId,
            score,
            totalPoints,
            percentage,
            passed,
            attempts: currentAttempts + 1,
            userAnswers,
            completedAt: firestore.FieldValue.serverTimestamp(),
          },
          { merge: true },
        );

        // ✅ Si réussi, on valide la progression dans la même transaction
        if (passed) {
          transaction.set(progressRef, {
            userId,
            trainingId,
            moduleId,
            lessonId: `quiz_${moduleId}`, // Identifiant spécial pour le quiz
            type: "quiz",
            completedAt: firestore.FieldValue.serverTimestamp(),
          });
        }

        return {
          score,
          totalPoints,
          percentage,
          passed,
          attempts: currentAttempts + 1,
        };
      });

      showSnack(
        passed ? "Bravo ! Quiz réussi." : "Score insuffisant, réessayez !",
        passed ? "success" : "error",
      );
      return finalResult;
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
