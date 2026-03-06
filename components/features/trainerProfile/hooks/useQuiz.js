import { db } from "@/components/lib/firebase";
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
  writeBatch
} from "@react-native-firebase/firestore";
import { useEffect, useState } from "react";

export function useQuiz(formationId, moduleId) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [snack, setSnack] = useState({
    visible: false,
    message: "",
    type: "success",
  });
  const showSnack = (message, type = "success") =>
    setSnack({ visible: true, message, type });
  const dismissSnack = () => setSnack((prev) => ({ ...prev, visible: false }));

  // ── Helper : référence collection quiz ──
  const quizColRef = () =>
    collection(db, "formations", formationId, "modules", moduleId, "quiz");

  // ─────────────────────────────────────────
  // 📡 ÉCOUTE TEMPS RÉEL
  // ─────────────────────────────────────────
  useEffect(() => {
    if (!formationId || !moduleId) {
      setQuestions([]);
      setLoading(false);
      return;
    }

    const q = query(quizColRef(), orderBy("order", "asc"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        setQuestions(data);
        setLoading(false);
      },
      (error) => {
        console.error("Erreur Quiz:", error);
        showSnack("Erreur lors du chargement", "error");
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [formationId, moduleId]);

  // ─────────────────────────────────────────
  // ➕ AJOUTER
  // ─────────────────────────────────────────
  const addQuestion = async (questionData) => {
    if (!questionData.question?.trim())
      return showSnack("Question requise", "error");
    try {
      setActionLoading(true);
      await addDoc(quizColRef(), {
        ...questionData,
        order: questions.length + 1,
        createdAt: serverTimestamp(),
      });
      showSnack("Question ajoutée");
    } catch (e) {
      console.error("addQuestion error:", e);
      showSnack("Erreur lors de l'ajout", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // ─────────────────────────────────────────
  // ✏️ MODIFIER
  // ─────────────────────────────────────────
  const updateQuestion = async (questionId, updatedData) => {
    try {
      setActionLoading(true);
      await updateDoc(
        doc(
          db,
          "formations",
          formationId,
          "modules",
          moduleId,
          "quiz",
          questionId,
        ),
        {
          ...updatedData,
          updatedAt: serverTimestamp(),
        },
      );
      showSnack("Question modifiée");
    } catch (e) {
      console.error("updateQuestion error:", e);
      showSnack("Erreur lors de la modification", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // ─────────────────────────────────────────
  // 🗑️ SUPPRIMER
  // ─────────────────────────────────────────
  const deleteQuestion = async (questionId) => {
    try {
      setActionLoading(true);
      const batch = writeBatch(db);

      batch.delete(
        doc(
          db,
          "formations",
          formationId,
          "modules",
          moduleId,
          "quiz",
          questionId,
        ),
      );

      const remaining = questions.filter((q) => q.id !== questionId);
      remaining.forEach((q, index) => {
        batch.update(
          doc(db, "formations", formationId, "modules", moduleId, "quiz", q.id),
          { order: index + 1 },
        );
      });

      await batch.commit();
      showSnack("Question supprimée");
    } catch (e) {
      console.error("deleteQuestion error:", e);
      showSnack("Erreur lors de la suppression", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // ─────────────────────────────────────────
  // 📊 SOUMETTRE LES RÉPONSES
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

      const percentage =
        totalPoints > 0 ? Math.round((score / totalPoints) * 100) : 0;
      const passed = percentage >= passingScore;

      // 2. Références
      const resultId = `${userId}_${moduleId}`;
      const resultRef = doc(db, "quizResults", resultId);
      const progressRef = doc(db, "userProgress", `${userId}_quiz_${moduleId}`);

      // 3. Transaction atomique
      const finalResult = await runTransaction(db, async (transaction) => {
        const resultSnap = await transaction.get(resultRef);
        const currentAttempts = resultSnap.exists()
          ? resultSnap.data().attempts || 0
          : 0;

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
            completedAt: serverTimestamp(),
          },
          { merge: true },
        );

        if (passed) {
          transaction.set(progressRef, {
            userId,
            trainingId,
            moduleId,
            lessonId: `quiz_${moduleId}`,
            type: "quiz",
            completedAt: serverTimestamp(),
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
