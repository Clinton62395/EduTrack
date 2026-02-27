import { useAuth } from "@/components/constants/authContext";
import { useQuiz } from "@/components/features/trainerProfile/hooks/useQuiz";
import { MyLoader } from "@/components/ui/loader";
import { Snack } from "@/components/ui/snackbar";
import { Box, Button, Text } from "@/components/ui/theme";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  XCircle,
} from "lucide-react-native";
import { useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/**
 * Écran de passage du quiz côté apprenant.
 *
 * Params Expo Router :
 * - formationId, moduleId, moduleTitle
 */
export default function QuizScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { formationId, moduleId, moduleTitle } = useLocalSearchParams();

  const { questions, loading, actionLoading, submitQuiz, snack, dismissSnack } =
    useQuiz(formationId, moduleId);

  // ── État du quiz ──
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({}); // { questionIndex: optionIndex }
  const [result, setResult] = useState(null); // Résultat après soumission
  const [submitted, setSubmitted] = useState(false);

  if (loading) return <MyLoader message="Chargement du quiz..." />;

  // ── Pas de questions ──
  if (questions.length === 0) {
    return (
      <Box flex={1} justifyContent="center" alignItems="center" padding="xl">
        <Text color="muted" textAlign="center">
          Ce module n&apos;a pas encore de quiz.
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ marginTop: 20 }}
        >
          <Text color="primary">Retour</Text>
        </TouchableOpacity>
      </Box>
    );
  }

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const isLast = currentIndex === totalQuestions - 1;
  const isAnswered = userAnswers[currentIndex] !== undefined;
  const answeredCount = Object.keys(userAnswers).length;

  // ─────────────────────────────────────────
  // ✅ SÉLECTIONNER UNE RÉPONSE
  // ─────────────────────────────────────────
  const handleSelectAnswer = (optionIndex) => {
    // On ne peut plus changer la réponse une fois soumis
    if (submitted) return;
    setUserAnswers((prev) => ({ ...prev, [currentIndex]: optionIndex }));
  };

  // ─────────────────────────────────────────
  // 📤 SOUMETTRE LE QUIZ
  // ─────────────────────────────────────────
  const handleSubmit = async () => {
    // Convertir les réponses en tableau ordonné
    const answersArray = questions.map((_, i) => userAnswers[i] ?? -1);

    const quizResult = await submitQuiz(user.uid, formationId, answersArray);

    if (quizResult) {
      setResult(quizResult);
      setSubmitted(true);
    }
  };

  // ─────────────────────────────────────────
  // 🏆 ÉCRAN DE RÉSULTAT
  // ─────────────────────────────────────────
  if (submitted && result) {
    return (
      <Box
        flex={1}
        backgroundColor="white"
        padding="xl"
        justifyContent="center"
        alignItems="center"
      >
        {/* Icône résultat */}
        <Box
          width={100}
          height={100}
          borderRadius="rounded"
          backgroundColor={result.passed ? "successLight" : "secondaryBackground"}
          justifyContent="center"
          alignItems="center"
          marginBottom="l"
        >
          {result.passed ? (
            <CheckCircle2 size={50} color="#10B981" />
          ) : (
            <XCircle size={50} color="#EF4444" />
          )}
        </Box>

        {/* Score */}
        <Text
          style={{
            fontSize: 56,
            fontWeight: "bold",
            color: result.passed ? "success" : "danger",
          }}
        >
          {result.percentage}%
        </Text>

        <Text
          variant="title"
          marginTop="s"
          marginBottom="xs"
          textAlign="center"
        >
          {result.passed ? "Quiz réussi ! 🎉" : "Quiz échoué"}
        </Text>

        <Text variant="body" color="muted" textAlign="center" marginBottom="l">
          {result.score}/{result.totalPoints} points •{" "}
          {result.passed
            ? "Vous avez validé ce module."
            : "Score minimum requis : 70%. Réessayez !"}
        </Text>

        {/* Détail des réponses */}
        <ScrollView
          style={{ width: "100%", maxHeight: 200 }}
          showsVerticalScrollIndicator={false}
        >
          {questions.map((q, index) => {
            const userAnswer = userAnswers[index];
            const isCorrect = userAnswer === q.correctIndex;
            return (
              <Box
                key={q.id}
                flexDirection="row"
                alignItems="center"
                gap="s"
                marginBottom="xs"
                padding="s"
                borderRadius="m"
                backgroundColor={isCorrect ? "successLight" : "secondaryBackground"}
              >
                {isCorrect ? (
                  <CheckCircle2 size={16} color="#10B981" />
                ) : (
                  <XCircle size={16} color="#EF4444" />
                )}
                <Text variant="caption" flex={1} numberOfLines={1}>
                  {index + 1}. {q.question}
                </Text>
              </Box>
            );
          })}
        </ScrollView>

        {/* Boutons */}
        <Box width="100%" gap="m" marginTop="l">
          {!result.passed && (
            <Button
              title="Réessayer"
              variant="primary"
              onPress={() => {
                setUserAnswers({});
                setCurrentIndex(0);
                setResult(null);
                setSubmitted(false);
              }}
            />
          )}
          <Button
            title="Retour au module"
            variant="outline"
            onPress={() => router.back()}
          />
        </Box>

        <Snack
          visible={snack.visible}
          message={snack.message}
          type={snack.type}
          onDismiss={dismissSnack}
        />
      </Box>
    );
  }

  // ─────────────────────────────────────────
  // 📝 ÉCRAN DE QUESTION
  // ─────────────────────────────────────────
  return (
    <Box flex={1} backgroundColor="secondaryBackground">
      {/* ─── HEADER ─── */}
      <Box
        backgroundColor="white"
        paddingHorizontal="l"
        paddingBottom="m"
        borderBottomWidth={1}
        borderBottomColor="border"
        style={{ paddingTop: insets.top + 10 }}
      >
        <Box flexDirection="row" alignItems="center" gap="m">
          <TouchableOpacity onPress={() => router.back()}>
            <ChevronLeft size={24} color="#111827" />
          </TouchableOpacity>
          <Box flex={1}>
            <Text variant="caption" color="muted">
              Quiz • {moduleTitle}
            </Text>
            <Text variant="body" fontWeight="bold">
              Question {currentIndex + 1} / {totalQuestions}
            </Text>
          </Box>
          {/* Compteur de réponses */}
          <Text variant="caption" color="primary">
            {answeredCount}/{totalQuestions} répondues
          </Text>
        </Box>

        {/* Barre de progression */}
        <Box
          height={6}
          backgroundColor="secondaryBackground"
          borderRadius="rounded"
          overflow="hidden"
          marginTop="m"
        >
          <Box
            height={6}
            borderRadius="rounded"
            backgroundColor="primary"
            style={{
              width: `${((currentIndex + 1) / totalQuestions) * 100}%`,
            }}
          />
        </Box>
      </Box>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 120 }}>
        {/* ── Question ── */}
        <Box
          backgroundColor="white"
          borderRadius="xl"
          padding="l"
          marginBottom="l"
          style={styles.card}
        >
          <Text variant="body" fontWeight="bold" style={{ lineHeight: 24 }}>
            {currentQuestion.question}
          </Text>
          <Text variant="caption" color="muted" marginTop="s">
            {currentQuestion.points || 1} point
            {currentQuestion.points > 1 ? "s" : ""}
          </Text>
        </Box>

        {/* ── Options ── */}
        {currentQuestion.options?.map((option, optIndex) => {
          const isSelected = userAnswers[currentIndex] === optIndex;
          return (
            <TouchableOpacity
              key={optIndex}
              onPress={() => handleSelectAnswer(optIndex)}
              activeOpacity={0.8}
            >
              <Box
                backgroundColor={isSelected ? "primary" : "white"}
                borderRadius="l"
                padding="m"
                marginBottom="s"
                flexDirection="row"
                alignItems="center"
                gap="m"
                borderWidth={2}
                borderColor={isSelected ? "primary" : "border"}
                style={styles.card}
              >
                {/* Lettre A/B/C/D */}
                <Box
                  width={32}
                  height={32}
                  borderRadius="rounded"
                  backgroundColor={isSelected ? "white" : "secondaryBackground"}
                  justifyContent="center"
                  alignItems="center"
                >
                  <Text
                    fontWeight="bold"
                    style={{ color: isSelected ? "#2563EB" : "#6B7280" }}
                  >
                    {String.fromCharCode(65 + optIndex)}
                  </Text>
                </Box>
                <Text
                  variant="body"
                  flex={1}
                  style={{ color: isSelected ? "white" : "#111827" }}
                >
                  {option}
                </Text>
              </Box>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* ─── NAVIGATION BAS ─── */}
      <Box
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        backgroundColor="white"
        padding="m"
        borderTopWidth={1}
        borderTopColor="border"
        flexDirection="row"
        gap="m"
        style={{ paddingBottom: insets.bottom + 10 }}
      >
        {/* Précédent */}
        {currentIndex > 0 && (
          <TouchableOpacity
            onPress={() => setCurrentIndex((i) => i - 1)}
            style={[styles.navButton, { backgroundColor: "#F3F4F6" }]}
          >
            <ChevronLeft size={20} color="#374151" />
            <Text style={{ color: "#374151" }}>Précédent</Text>
          </TouchableOpacity>
        )}

        {/* Suivant ou Soumettre */}
        {!isLast ? (
          <TouchableOpacity
            onPress={() => setCurrentIndex((i) => i + 1)}
            disabled={!isAnswered}
            style={[
              styles.navButton,
              { flex: 1, backgroundColor: isAnswered ? "#2563EB" : "#D1D5DB" },
            ]}
          >
            <Text style={{ color: "white", fontWeight: "bold" }}>Suivant</Text>
            <ChevronRight size={20} color="white" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={answeredCount < totalQuestions || actionLoading}
            style={[
              styles.navButton,
              {
                flex: 1,
                backgroundColor:
                  answeredCount < totalQuestions ? "#D1D5DB" : "#10B981",
              },
            ]}
          >
            <Text style={{ color: "white", fontWeight: "bold" }}>
              {actionLoading
                ? "Envoi..."
                : answeredCount < totalQuestions
                  ? `Répondez à toutes (${answeredCount}/${totalQuestions})`
                  : "Soumettre le quiz"}
            </Text>
          </TouchableOpacity>
        )}
      </Box>
    </Box>
  );
}

const styles = StyleSheet.create({
  card: {
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  navButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 6,
  },
});
