import { MyLoader } from "@/components/ui/loader";
import { Snack } from "@/components/ui/snackbar";
import { Box, Text } from "@/components/ui/theme";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ChevronLeft,
  Edit2,
  HelpCircle,
  Plus,
  Trash2,
} from "lucide-react-native";
import { useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AddQuestionModal } from "../../../../../(modal)/trainerModal/quizModal";
import { useQuiz } from "@/components/features/trainerProfile/hooks/useQuiz";

/**
 * Écran de création/gestion du quiz d'un module (côté trainer).
 *
 * Params Expo Router attendus :
 * - formationId
 * - moduleId
 * - moduleTitle
 */
export default function QuizBuilderScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { formationId, moduleId, moduleTitle } = useLocalSearchParams();

  const {
    questions,
    loading,
    actionLoading,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    snack,
    dismissSnack,
  } = useQuiz(formationId, moduleId);

  // ── État du modal ──
  const [modal, setModal] = useState({
    visible: false,
    selectedQuestion: null,
  });

  const openAddModal = () =>
    setModal({ visible: true, selectedQuestion: null });

  const openEditModal = (question) =>
    setModal({ visible: true, selectedQuestion: question });

  const closeModal = () => setModal({ visible: false, selectedQuestion: null });

  const handleSubmit = async (data) => {
    if (modal.selectedQuestion) {
      await updateQuestion(modal.selectedQuestion.id, data);
    } else {
      await addQuestion(data);
    }
    closeModal();
  };

  // Calcul du total des points
  const totalPoints = questions.reduce((acc, q) => acc + (q.points || 1), 0);

  if (loading) return <MyLoader message="Chargement du quiz..." />;

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
              Quiz du module
            </Text>
            <Text variant="title" numberOfLines={1}>
              {moduleTitle || "Quiz"}
            </Text>
          </Box>
          <TouchableOpacity onPress={openAddModal} style={styles.addButton}>
            <Plus size={22} color="white" />
          </TouchableOpacity>
        </Box>

        {/* Stats du quiz */}
        {questions.length > 0 && (
          <Box
            flexDirection="row"
            gap="m"
            marginTop="m"
            backgroundColor="secondaryBackground"
            padding="s"
            borderRadius="m"
          >
            <Text variant="caption" color="muted">
              {questions.length} question{questions.length > 1 ? "s" : ""}
            </Text>
            <Text variant="caption" color="muted">
              ·
            </Text>
            <Text variant="caption" color="muted">
              {totalPoints} point{totalPoints > 1 ? "s" : ""} au total
            </Text>
            <Text variant="caption" color="muted">
              ·
            </Text>
            <Text variant="caption" color="primary">
              Score min: 70%
            </Text>
          </Box>
        )}
      </Box>

      {/* ─── LISTE DES QUESTIONS ─── */}
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {questions.length === 0 ? (
          // ── État vide ──
          <Box
            padding="xl"
            alignItems="center"
            backgroundColor="white"
            borderRadius="xl"
            style={styles.card}
          >
            <HelpCircle size={48} color="#D1D5DB" />
            <Text
              variant="body"
              color="muted"
              textAlign="center"
              marginTop="m"
              marginBottom="l"
            >
              Aucune question pour ce quiz.{"\n"}Appuyez sur{" "}
              <Text fontWeight="bold" color="primary">
                +
              </Text>{" "}
              pour commencer.
            </Text>
            <TouchableOpacity onPress={openAddModal} style={styles.emptyButton}>
              <Text color="white" fontWeight="bold">
                Ajouter une question
              </Text>
            </TouchableOpacity>
          </Box>
        ) : (
          questions.map((question, index) => (
            <Box
              key={question.id}
              backgroundColor="white"
              borderRadius="l"
              padding="m"
              marginBottom="m"
              style={styles.card}
            >
              {/* Numéro + question */}
              <Box
                flexDirection="row"
                justifyContent="space-between"
                alignItems="flex-start"
                marginBottom="m"
              >
                <Box flex={1} flexDirection="row" gap="s">
                  {/* Badge numéro */}
                  <Box
                    width={28}
                    height={28}
                    borderRadius="rounded"
                    backgroundColor="primary"
                    justifyContent="center"
                    alignItems="center"
                  >
                    <Text variant="caption" color="white" fontWeight="bold">
                      {index + 1}
                    </Text>
                  </Box>
                  <Text variant="body" fontWeight="bold" flex={1}>
                    {question.question}
                  </Text>
                </Box>

                {/* Actions */}
                <Box flexDirection="row" gap="m" marginLeft="s">
                  <TouchableOpacity
                    onPress={() => openEditModal(question)}
                    hitSlop={10}
                  >
                    <Edit2 size={18} color="#2563EB" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => deleteQuestion(question.id)}
                    hitSlop={10}
                  >
                    <Trash2 size={18} color="#EF4444" />
                  </TouchableOpacity>
                </Box>
              </Box>

              {/* Options */}
              {question.options?.map((option, optIndex) => {
                const isCorrect = optIndex === question.correctIndex;
                return (
                  <Box
                    key={optIndex}
                    flexDirection="row"
                    alignItems="center"
                    gap="s"
                    paddingVertical="xs"
                    paddingHorizontal="s"
                    borderRadius="m"
                    marginBottom="xs"
                    backgroundColor={
                      isCorrect ? "successLight" : "secondaryBackground"
                    }
                  >
                    <Box
                      width={20}
                      height={20}
                      borderRadius="rounded"
                      backgroundColor={isCorrect ? "success" : "border"}
                      justifyContent="center"
                      alignItems="center"
                    >
                      <Text
                        style={{
                          fontSize: 10,
                          color: "white",
                          fontWeight: "bold",
                        }}
                      >
                        {String.fromCharCode(65 + optIndex)}
                      </Text>
                    </Box>
                    <Text
                      variant="caption"
                      flex={1}
                      style={{ color: isCorrect ? "success" : "text" }}
                      fontWeight={isCorrect ? "bold" : "normal"}
                    >
                      {option}
                    </Text>
                    {isCorrect && (
                      <Text variant="caption" color="success">
                        ✓ Correct
                      </Text>
                    )}
                  </Box>
                );
              })}

              {/* Points */}
              <Text
                variant="caption"
                color="muted"
                marginTop="s"
                textAlign="right"
              >
                {question.points || 1} point{question.points > 1 ? "s" : ""}
              </Text>
            </Box>
          ))
        )}
      </ScrollView>

      {/* ─── MODAL ─── */}
      <AddQuestionModal
        visible={modal.visible}
        onClose={closeModal}
        onSubmit={handleSubmit}
        loading={actionLoading}
        question={modal.selectedQuestion}
      />

      {/* ─── SNACK ─── */}
      <Snack
        visible={snack.visible}
        message={snack.message}
        type={snack.type}
        onDismiss={dismissSnack}
      />
    </Box>
  );
}

const styles = StyleSheet.create({
  addButton: {
    backgroundColor: "#2563EB",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#2563EB",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  card: {
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  emptyButton: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
});
