import { db } from "@/components/lib/firebase";
import firestore from "@react-native-firebase/firestore";
import { useEffect, useState } from "react";
// firestore via db; FieldValue via firestore.FieldValue

/**
 * Hook de gestion du quiz d'un module.
 *
 * Structure Firestore :
 * formations/{formationId}/modules/{moduleId}/quiz/{questionId}
 *   - question : string
 *   - options  : string[] (4 choix)
 *   - correctIndex : number (index de la bonne réponse dans options)
 *   - points   : number (défaut 1)
 *   - order    : number
 *
 * Résultats :
 * quizResults/{userId}_{moduleId}
 *   - userId, moduleId, trainingId
 *   - score, totalPoints, percentage
 *   - passed : boolean
 *   - attempts : number
 *   - completedAt : timestamp
 *
 * @param {string} formationId
 * @param {string} moduleId
 */
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

  // ── Chemin Firestore ──
  const questionsPath = () =>
    db
      .collection("formations")
      .doc(formationId)
      .collection("modules")
      .doc(moduleId)
      .collection("quiz");

  const questionDocPath = (questionId) =>
    db
      .collection("formations")
      .doc(formationId)
      .collection("modules")
      .doc(moduleId)
      .collection("quiz")
      .doc(questionId);

  // ─────────────────────────────────────────
  // 📡 ÉCOUTE TEMPS RÉEL DES QUESTIONS
  // ─────────────────────────────────────────
  useEffect(() => {
    if (!formationId || !moduleId) {
      setQuestions([]);
      setLoading(false);
      return;
    }

    const q = questionsPath().orderBy("order", "asc");

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setQuestions(
          snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
        );
        setLoading(false);
      },
      (error) => {
        console.error("Erreur chargement quiz:", error);
        showSnack("Erreur lors du chargement du quiz", "error");
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [formationId, moduleId]);

  // ─────────────────────────────────────────
  // ➕ AJOUTER UNE QUESTION
  // ─────────────────────────────────────────
  /**
   * @param {Object} questionData
   * @param {string} questionData.question - Texte de la question
   * @param {string[]} questionData.options - 4 choix de réponse
   * @param {number} questionData.correctIndex - Index de la bonne réponse
   * @param {number} [questionData.points] - Points pour cette question (défaut 1)
   */
  const addQuestion = async (questionData) => {
    if (!questionData.question?.trim()) {
      showSnack("La question est requise", "error");
      return;
    }
    if (!questionData.options || questionData.options.length < 2) {
      showSnack("Au moins 2 options sont requises", "error");
      return;
    }

    try {
      setActionLoading(true);

      await questionsPath().add({
        question: questionData.question.trim(),
        options: questionData.options.map((o) => o.trim()),
        correctIndex: questionData.correctIndex ?? 0,
        points: questionData.points || 1,
        order: questions.length + 1,
        createdAt: firestore.FieldValue.serverTimestamp(),
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });

      showSnack("Question ajoutée", "success");
    } catch (error) {
      console.error("Erreur ajout question:", error);
      showSnack("Impossible d'ajouter la question", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // ─────────────────────────────────────────
  // ✏️ MODIFIER UNE QUESTION
  // ─────────────────────────────────────────
  const updateQuestion = async (questionId, updatedData) => {
    try {
      setActionLoading(true);

      await questionDocPath(questionId).update({
        ...updatedData,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });

      showSnack("Question modifiée", "success");
    } catch (error) {
      console.error("Erreur modification question:", error);
      showSnack("Impossible de modifier la question", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // ─────────────────────────────────────────
  // 🗑️ SUPPRIMER UNE QUESTION + réindexation
  // ─────────────────────────────────────────
  const deleteQuestion = async (questionId) => {
    try {
      setActionLoading(true);

      const batch = db.batch();
      batch.delete(questionDocPath(questionId));

      // Réindexation des questions restantes
      const remaining = questions.filter((q) => q.id !== questionId);
      remaining.forEach((q, index) => {
        batch.update(questionDocPath(q.id), { order: index + 1 });
      });

      await batch.commit();
      showSnack("Question supprimée", "success");
    } catch (error) {
      console.error("Erreur suppression question:", error);
      showSnack("Impossible de supprimer la question", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // ─────────────────────────────────────────
  // 📊 SOUMETTRE LES RÉPONSES (learner)
  // ─────────────────────────────────────────
  /**
   * Calcule le score et enregistre le résultat dans Firestore.
   *
   * @param {string} userId
   * @param {string} trainingId
   * @param {number[]} userAnswers - Tableau des index de réponses choisies
   * @param {number} passingScore - Score minimum pour valider (défaut 70%)
   */
  const submitQuiz = async (
    userId,
    trainingId,
    userAnswers,
    passingScore = 70,
  ) => {
    try {
      setActionLoading(true);

      // Calcul du score
      let score = 0;
      const totalPoints = questions.reduce(
        (acc, q) => acc + (q.points || 1),
        0,
      );

      questions.forEach((question, index) => {
        if (userAnswers[index] === question.correctIndex) {
          score += question.points || 1;
        }
      });

      const percentage = Math.round((score / totalPoints) * 100);
      const passed = percentage >= passingScore;

      // Vérifier si un résultat existe déjà pour incrémenter les tentatives
      // const existingResultRef = db.collection("quizResults").doc(`${userId}_${moduleId}`);

      const existingSnap = await db
        .collection("quizResults")
        .where("userId", "==", userId)
        .where("moduleId", "==", moduleId)
        .get();

      const attempts = existingSnap.empty
        ? 1
        : (existingSnap.docs[0].data().attempts || 0) + 1;

      // Enregistrement du résultat
      await db.collection("quizResults").add({
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
      });

      // Si réussi, marquer dans userProgress
      if (passed) {
        await db.collection("userProgress").add({
          userId,
          trainingId,
          moduleId,
          lessonId: `quiz_${moduleId}`, // ID unique pour le quiz
          completedAt: firestore.FieldValue.serverTimestamp(),
        });
      }

      return { score, totalPoints, percentage, passed, attempts };
    } catch (error) {
      console.error("Erreur soumission quiz:", error);
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
