import { MyLoader } from "@/components/ui/loader";
import { Snack } from "@/components/ui/snackbar";
import { Box, Text } from "@/components/ui/theme";
import { useLocalSearchParams, useRouter } from "expo-router";
import { BookOpen, ChevronLeft, HelpCircle, Plus } from "lucide-react-native";
import { useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AddLessonModal } from "../../../app/(modal)/trainerModal/addLessonsModal";
import { useLessons } from "../../../components/features/trainerProfile/hooks/useLessons";
import { LessonCard } from "../../../components/features/trainerProfile/lessonsCard";

export default function ModuleDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { formationId, moduleId, moduleTitle } = useLocalSearchParams();

  const {
    lessons,
    loading,
    actionLoading,
    addLesson,
    updateLesson,
    deleteLesson,
    snack,
    dismissSnack,
  } = useLessons(formationId, moduleId);

  const [modal, setModal] = useState({
    visible: false,
    selectedLesson: null,
  });

  const openAddModal = () => setModal({ visible: true, selectedLesson: null });
  const openEditModal = (lesson) =>
    setModal({ visible: true, selectedLesson: lesson });
  const closeModal = () => setModal({ visible: false, selectedLesson: null });

  const handleSubmit = async (data) => {
    if (modal.selectedLesson) {
      await updateLesson(modal.selectedLesson.id, data);
    } else {
      await addLesson(data);
    }
    closeModal();
  };

  // Navigation vers QuizBuilderScreen
  const goToQuiz = () =>
    router.push({
      pathname: "/(trainer-tabs)/trainings/[moduleId]/quiz",
      params: { formationId, moduleId, moduleTitle },
    });

  if (loading) return <MyLoader message="Chargement des leçons..." />;

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
              Module
            </Text>
            <Text variant="title" numberOfLines={1}>
              {moduleTitle || "Contenu du module"}
            </Text>
          </Box>

          {/* ✅ Bouton Quiz dans le header */}
          <TouchableOpacity onPress={goToQuiz} style={styles.quizButton}>
            <HelpCircle size={20} color="#2563EB" />
          </TouchableOpacity>

          {/* Bouton ajout leçon */}
          <TouchableOpacity onPress={openAddModal} style={styles.addButton}>
            <Plus size={22} color="white" />
          </TouchableOpacity>
        </Box>
      </Box>

      {/* ─── LISTE DES LEÇONS ─── */}
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {lessons.length > 0 ? (
          <>
            <Text variant="caption" color="muted" marginBottom="m">
              {lessons.length} leçon{lessons.length > 1 ? "s" : ""}
            </Text>

            {/* Liste des leçons */}
            {lessons.map((lesson, index) => (
              <LessonCard
                key={lesson.id}
                lesson={lesson}
                index={index}
                onEdit={() => openEditModal(lesson)}
                onDelete={() => deleteLesson(lesson.id)}
                onPress={() =>
                  router.push({
                    pathname: "/(trainer-tabs)/trainings/[lessonsId]",
                    params: {
                      lessonId: lesson.id,
                      formationId,
                      moduleId,
                      isLearner: "false",
                    },
                  })
                }
              />
            ))}

            {/* ✅ CARTE QUIZ en bas de la liste */}
            <TouchableOpacity activeOpacity={0.8} onPress={goToQuiz}>
              <Box
                borderRadius="l"
                padding="m"
                marginTop="s"
                flexDirection="row"
                alignItems="center"
                gap="m"
                borderWidth={2}
                borderColor="primary"
                backgroundColor="white"
                style={styles.quizCard}
              >
                <Box
                  width={44}
                  height={44}
                  borderRadius="m"
                  backgroundColor="#EFF6FF"
                  justifyContent="center"
                  alignItems="center"
                >
                  <HelpCircle size={24} color="#2563EB" />
                </Box>
                <Box flex={1}>
                  <Text variant="body" fontWeight="bold" color="primary">
                    Quiz du module
                  </Text>
                  <Text variant="caption" color="muted">
                    Gérer les questions
                  </Text>
                </Box>
              </Box>
            </TouchableOpacity>
          </>
        ) : (
          // ── État vide ──
          <Box
            flex={1}
            padding="xl"
            alignItems="center"
            justifyContent="center"
            backgroundColor="white"
            borderRadius="xl"
            style={styles.emptyCard}
          >
            <BookOpen size={48} color="#D1D5DB" />
            <Text
              variant="body"
              color="muted"
              textAlign="center"
              marginTop="m"
              marginBottom="l"
            >
              Ce module n&apos;a pas encore de leçons.{"\n"}Appuyez sur{" "}
              <Text fontWeight="bold" color="primary">
                <Plus size={22} color="white" />
              </Text>{" "}
              pour commencer.
            </Text>
            <TouchableOpacity onPress={openAddModal} style={styles.emptyButton}>
              <Text color="white" fontWeight="bold">
                Ajouter une leçon
              </Text>
            </TouchableOpacity>
          </Box>
        )}
      </ScrollView>

      {/* ─── MODAL CRÉATION / ÉDITION ─── */}
      <AddLessonModal
        visible={modal.visible}
        onClose={closeModal}
        onSubmit={handleSubmit}
        loading={actionLoading}
        lesson={modal.selectedLesson}
      />

      {/* ─── FEEDBACK SNACK ─── */}
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
  quizButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
  },
  quizCard: {
    elevation: 1,
    shadowColor: "#2563EB",
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  emptyCard: {
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
