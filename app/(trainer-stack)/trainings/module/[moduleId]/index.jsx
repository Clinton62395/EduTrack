import { useModuleDetail } from "@/components/features/trainerProfile/hooks/useModuleDetails";
import { LessonCard } from "@/components/features/trainerProfile/lessonsCard";
import { MyLoader } from "@/components/ui/loader";
import { Snack } from "@/components/ui/snackbar";
import { Box, Text } from "@/components/ui/theme";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft, HelpCircle, Plus } from "lucide-react-native";
import { FlatList, StyleSheet, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import  AddLessonModal  from "../../../../(modal)/trainerModal/addLessonsModal";
import { EmptyModuleContent } from "@/components/features/trainerProfile/moduleAction/emptyModuleContent";
import { QuizCard } from "@/components/features/trainerProfile/moduleAction/quizCard";

export default function ModuleDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { formationId, moduleId, moduleTitle } = useLocalSearchParams();

  const {
    lessons,
    loading,
    actionLoading,
    uploadingPDF,
    pickAndUploadPDF,
    modal,
    snack,
    handlers,
  } = useModuleDetail(formationId, moduleId, moduleTitle);

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

      {/* LISTE */}
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
              onDelete={() => handlers.handleDelete(item.id)}
              onPress={() => handlers.goToLessonDetail(item.id)}
            />
          )}
          ListFooterComponent={<QuizCard onPress={handlers.goToQuiz} />}
        />
      ) : (
        <EmptyModuleContent onAdd={handlers.openAddModal} />
      )}

      {/* MODAL */}
      <AddLessonModal
        visible={modal.visible}
        onClose={handlers.closeModal}
        onSubmit={handlers.handleSubmit}
        onPickPDF={pickAndUploadPDF}
        loading={actionLoading}
        uploadingPDF={uploadingPDF}
        lesson={modal.selectedLesson}
      />

      {/* SNACK */}
      <Snack
        visible={snack.visible}
        message={snack.message}
        type={snack.type}
        onDismiss={handlers.dismissSnack}
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
});
