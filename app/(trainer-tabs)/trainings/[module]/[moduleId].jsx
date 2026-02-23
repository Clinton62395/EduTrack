// ModuleDetailScreen.tsx
import { useModuleDetail } from "@/components/features/trainerProfile/hooks/useModuleDetails";
import { LessonCard } from "@/components/features/trainerProfile/lessonsCard";
import { MyLoader } from "@/components/ui/loader";
import { Snack } from "@/components/ui/snackbar";
import { Box, Text } from "@/components/ui/theme";
import { useLocalSearchParams, useRouter } from "expo-router";
import { BookOpen, ChevronLeft, HelpCircle, Plus } from "lucide-react-native";
import { FlatList, StyleSheet, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AddLessonModal } from "../../../(modal)/trainerModal/addLessonsModal";

// ─── Composant QuizCard ───
const QuizCard = ({ onPress }) => (
  <TouchableOpacity activeOpacity={0.8} onPress={onPress}>
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
        backgroundColor="white"
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
);

// ─── Composant EmptyModule ───
const EmptyModule = ({ onAdd }) => (
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
      Ce module n'a pas encore de leçons.{"\n"}Appuyez sur le bouton pour
      commencer.
    </Text>
    <TouchableOpacity onPress={onAdd} style={styles.emptyButton}>
      <Text color="white" fontWeight="bold">
        Ajouter une leçon
      </Text>
    </TouchableOpacity>
  </Box>
);

// ─── Composant principal ───
export default function ModuleDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { formationId, moduleId, moduleTitle } = useLocalSearchParams();

  const { lessons, loading, actionLoading, modal, snack, handlers } =
    useModuleDetail(formationId, moduleId, moduleTitle);

  if (loading) return <MyLoader message="Chargement des leçons..." />;

  return (
    <Box flex={1} backgroundColor="secondaryBackground">
      {/* HEADER */}
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

          <TouchableOpacity
            onPress={handlers.goToQuiz}
            style={styles.quizButton}
          >
            <HelpCircle size={20} color="#2563EB" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handlers.openAddModal}
            style={styles.addButton}
          >
            <Plus size={22} color="white" />
          </TouchableOpacity>
        </Box>
      </Box>

      {/* LISTE DES LEÇONS */}
      {lessons.length > 0 ? (
        <FlatList
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
          data={lessons}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={
            <Text variant="caption" color="muted" marginBottom="m">
              {lessons.length} leçon{lessons.length > 1 ? "s" : ""}
            </Text>
          }
          renderItem={({ item, index }) => (
            <LessonCard
              lesson={item}
              index={index}
              onEdit={() => handlers.openEditModal(item)}
              onDelete={() => handlers.deleteLesson(item.id)}
              onPress={() => handlers.goToLessonDetail(item.id)}
            />
          )}
          ListFooterComponent={<QuizCard onPress={handlers.goToQuiz} />}
        />
      ) : (
        <EmptyModule onAdd={handlers.openAddModal} />
      )}

      {/* MODAL & SNACK */}
      <AddLessonModal
        visible={modal.visible}
        onClose={handlers.closeModal}
        onSubmit={handlers.handleSubmit}
        loading={actionLoading}
        lesson={modal.selectedLesson}
      />
      <Snack
        visible={snack.visible}
        message={snack.message}
        type={snack.type}
        onDismiss={handlers.dismissSnack}
      />
    </Box>
  );
}

// ─── Styles ───
const styles = StyleSheet.create({
  addButton: {
    backgroundColor: "#2563EB",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
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
    shadowOffset: { width: 0, height: 2 }, // iOS
  },
  emptyCard: {
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 }, // iOS
  },
  emptyButton: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
});
