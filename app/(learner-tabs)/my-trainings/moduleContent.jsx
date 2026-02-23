import { useAuth } from "@/components/constants/authContext";
import { useLearnerProgress } from "@/components/features/learnerProfile/hooks/useLearnerProgress";
import { useLessons } from "@/components/features/trainerProfile/hooks/useLessons";
import { MyLoader } from "@/components/ui/loader";
import { Box, Text } from "@/components/ui/theme";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileText,
  Play,
} from "lucide-react-native";
import { useMemo } from "react";
import { ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { QuizCard } from "../../../components/features/learnerProfile/quizCard";

// ─────────────────────────────────────────
// 🎨 CONFIG TYPE
// ─────────────────────────────────────────
const TYPE_CONFIG = {
  text: {
    label: "Lecture",
    icon: BookOpen,
    color: "primary",
    bg: "infoBackground",
  },
  video: {
    label: "Vidéo",
    icon: Play,
    color: "danger",
    bg: "secondaryBackground",
  },
  pdf: {
    label: "PDF",
    icon: FileText,
    color: "warning",
    bg: "warningBackground",
  },
};

// ─────────────────────────────────────────
// 🧩 SCREEN
// ─────────────────────────────────────────
export default function ModuleContent() {
  const { user } = useAuth();
  const { trainingId, moduleId, moduleTitle } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { lessons, loading } = useLessons(trainingId, moduleId);
  const { completedLessonIds } = useLearnerProgress(user?.uid, trainingId);

  // ─────────────────────────────────────────
  // 📊 CALCUL PROGRESSION (memo optimisé)
  // ─────────────────────────────────────────
  const progress = useMemo(() => {
    const total = lessons.length;
    const completed = lessons.filter((l) =>
      completedLessonIds.includes(l.id),
    ).length;

    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, percentage };
  }, [lessons, completedLessonIds]);

  // logique d'affichage de la section quiz
  const allLessonsCompleted =
    progress.total > 0 && progress.completed === progress.total;

  if (loading) return <MyLoader message="Chargement des leçons..." />;

  return (
    <>
      <Box flex={1} backgroundColor="secondaryBackground">
        <ModuleHeader
          insets={insets}
          router={router}
          moduleTitle={moduleTitle}
          progress={progress}
        />

        <ScrollView
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {lessons.length === 0 ? (
            <EmptyState />
          ) : (
            lessons.map((lesson, index) => (
              <LessonItem
                key={lesson.id}
                lesson={lesson}
                index={index}
                moduleId={moduleId}
                trainingId={trainingId}
                router={router}
                completedLessonIds={completedLessonIds}
              />
            ))
          )}

          {lessons.length > 0 && (
            <QuizCard
              allLessonsCompleted={allLessonsCompleted}
              totalCount={progress.total}
              onPress={() =>
                router.push({
                  pathname:
                    "/(learner-tabs)/my-trainings/[moduleId]/learnerQuiz",
                  params: { formationId: trainingId, moduleId, moduleTitle },
                })
              }
            />
          )}
        </ScrollView>
      </Box>
    </>
  );
}

// ─────────────────────────────────────────
// 🧩 HEADER
// ─────────────────────────────────────────
function ModuleHeader({ insets, router, moduleTitle, progress }) {
  return (
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
            {moduleTitle || "Leçons"}
          </Text>
        </Box>
      </Box>

      {progress.total > 0 && <ProgressBar progress={progress} />}
    </Box>
  );
}

// ─────────────────────────────────────────
// 📊 PROGRESS BAR
// ─────────────────────────────────────────
function ProgressBar({ progress }) {
  return (
    <Box marginTop="m">
      <Box flexDirection="row" justifyContent="space-between" marginBottom="xs">
        <Text variant="caption" color="muted">
          {progress.completed}/{progress.total} leçons terminées
        </Text>
        <Text variant="caption" color="primary" fontWeight="bold">
          {progress.percentage}%
        </Text>
      </Box>

      <Box
        height={6}
        backgroundColor="secondaryBackground"
        borderRadius="rounded"
        overflow="hidden"
      >
        <Box
          height={6}
          borderRadius="rounded"
          backgroundColor="primary"
          style={{ width: `${progress.percentage}%` }}
        />
      </Box>
    </Box>
  );
}

// ─────────────────────────────────────────
// 📘 LESSON ITEM
// ─────────────────────────────────────────
function LessonItem({
  lesson,
  index,
  moduleId,
  trainingId,
  router,
  completedLessonIds,
}) {
  const isCompleted = completedLessonIds.includes(lesson.id);
  const typeConfig = TYPE_CONFIG[lesson.type] || TYPE_CONFIG.text;
  const Icon = typeConfig.icon;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() =>
        router.push({
          pathname:
            "/(learner-tabs)/my-trainings/[moduleId]/lessons/[lessonId]",
          params: {
            moduleId,
            lessonId: lesson.id,
            formationId: trainingId,
            isLearner: "true",
          },
        })
      }
    >
      <Box
        backgroundColor="white"
        borderRadius="l"
        padding="m"
        marginBottom="s"
        flexDirection="row"
        alignItems="center"
        style={[styles.card, isCompleted && styles.cardCompleted]}
      >
        <Box
          width={44}
          height={44}
          borderRadius="m"
          backgroundColor={isCompleted ? "successLight" : typeConfig.bg}
          justifyContent="center"
          alignItems="center"
          marginRight="m"
        >
          {isCompleted ? (
            <CheckCircle2 size={22} color="#10B981" />
          ) : (
            <Icon size={18} color={typeConfig.color} />
          )}
        </Box>

        <Box flex={1}>
          <Text
            variant="body"
            fontWeight="bold"
            numberOfLines={1}
            color={isCompleted ? "muted" : "text"}
          >
            {index + 1}. {lesson.title}
          </Text>

          <Box flexDirection="row" alignItems="center" gap="m" marginTop="xs">
            <Text variant="caption" color="muted">
              {typeConfig.label}
            </Text>

            {lesson.duration && (
              <Box flexDirection="row" alignItems="center" gap="xs">
                <Clock size={12} color="#6B7280" />
                <Text variant="caption" color="muted">
                  {lesson.duration} min
                </Text>
              </Box>
            )}

            {isCompleted && (
              <Text variant="caption" color="success">
                Terminée ✓
              </Text>
            )}
          </Box>
        </Box>

        <ChevronRight size={20} color="#6B7280" />
      </Box>
    </TouchableOpacity>
  );
}

// ─────────────────────────────────────────
// 📭 EMPTY STATE
// ─────────────────────────────────────────
function EmptyState() {
  return (
    <Box
      padding="xl"
      alignItems="center"
      backgroundColor="white"
      borderRadius="xl"
    >
      <BookOpen size={48} color="#D1D5DB" />
      <Text color="muted" marginTop="m" textAlign="center">
        Ce module ne contient encore aucune leçon.
      </Text>
      <Text variant="caption" color="muted" marginTop="s" textAlign="center">
        Le formateur ajoutera bientôt du contenu.
      </Text>
    </Box>
  );
}

// ─────────────────────────────────────────
// 🎨 STYLES
// ─────────────────────────────────────────
const styles = StyleSheet.create({
  card: {
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  cardCompleted: {
    opacity: 0.85,
    borderLeftWidth: 3,
    borderLeftColor: "#10B981",
  },
});
