import { useAuth } from "@/components/constants/authContext";
import { MyLoader } from "@/components/ui/loader";
import { Snack } from "@/components/ui/snackbar";
import { Box, Button, Text } from "@/components/ui/theme";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  FileText,
  Play,
} from "lucide-react-native";
import { useState } from "react";
import {
  Linking,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLessonQuery } from "../../../../../components/features/learnerProfile/hooks/useLessonsQuery";

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
    label: "Document PDF",
    icon: FileText,
    color: "warning",
    bg: "warningBackground",
  },
};

// ─────────────────────────────────────────
// 🧩 SCREEN
// ─────────────────────────────────────────
export default function LessonDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const { lessonId, moduleId, formationId, isLearner } = useLocalSearchParams();

  const isLearnerMode = isLearner === "true";

  const { lesson, loading, isCompleted, completing, completeLesson } =
    useLessonQuery({
      formationId,
      moduleId,
      lessonId,
      userId: user?.uid,
      isLearnerMode,
    });

  console.log("les inforamtion de la leçon", {
    formationId,
    moduleId,
    lessonId,
    userId: user?.uid,
    isLearnerMode,
  });

  const [snack, setSnack] = useState({
    visible: false,
    message: "",
    type: "success",
  });

  const showSnack = (message, type = "success") => {
    setSnack({ visible: true, message, type });
  };

  const dismissSnack = () => {
    setSnack((prev) => ({ ...prev, visible: false }));
  };

  const handleComplete = async () => {
    const result = await completeLesson();

    if (result?.success) {
      showSnack("Leçon marquée comme terminée 🎉");
      setTimeout(() => router.back(), 1500);
    } else {
      showSnack("Une erreur est survenue", "error");
    }
  };

  const handleOpenLink = () => {
    if (lesson?.content) {
      Linking.openURL(lesson.content);
    }
  };

  if (loading) return <MyLoader message="Chargement de la leçon..." />;

  if (!lesson) {
    return (
      <Box flex={1} justifyContent="center" alignItems="center">
        <Text color="muted">Leçon introuvable</Text>
      </Box>
    );
  }

  const typeConfig = TYPE_CONFIG[lesson.type] || TYPE_CONFIG.text;
  const Icon = typeConfig.icon;

  return (
    <Box flex={1} backgroundColor="secondaryBackground">
      <Header
        lesson={lesson}
        router={router}
        insets={insets}
        typeConfig={typeConfig}
        Icon={Icon}
      />

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        <LessonContent lesson={lesson} onOpenLink={handleOpenLink} />

        {isLearnerMode && isCompleted && <CompletedBadge />}
      </ScrollView>

      {isLearnerMode && !isCompleted && (
        <CompletionFooter
          insets={insets}
          completing={completing}
          onPress={handleComplete}
        />
      )}

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
// 🧩 SUB COMPONENTS
// ─────────────────────────────────────────

function Header({ lesson, router, insets, typeConfig, Icon }) {
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
          <Box flexDirection="row" alignItems="center" gap="xs">
            <Box
              paddingHorizontal="s"
              paddingVertical="xs"
              borderRadius="s"
              backgroundColor={typeConfig.bg}
              flexDirection="row"
              alignItems="center"
              gap="xs"
            >
              <Icon size={18} color={typeConfig.color} />
              <Text
                variant="caption"
                fontWeight="bold"
                style={{ color: typeConfig.color }}
              >
                {typeConfig.label}
              </Text>
            </Box>

            {lesson.duration && (
              <Text variant="caption" color="muted">
                · {lesson.duration} min
              </Text>
            )}
          </Box>

          <Text variant="title" numberOfLines={2}>
            {lesson.title}
          </Text>
        </Box>
      </Box>
    </Box>
  );
}

function LessonContent({ lesson, onOpenLink }) {
  if (lesson.type === "text") {
    return (
      <Box
        backgroundColor="white"
        borderRadius="xl"
        padding="l"
        style={styles.card}
      >
        <Text variant="body" style={{ lineHeight: 26 }}>
          {lesson.content}
        </Text>
      </Box>
    );
  }

  return (
    <Box
      backgroundColor="white"
      borderRadius="xl"
      padding="l"
      alignItems="center"
      style={styles.card}
    >
      <Preview type={lesson.type} />

      <TouchableOpacity onPress={onOpenLink} style={styles.linkButton}>
        <Text color="white" fontWeight="bold">
          Ouvrir le contenu
        </Text>
      </TouchableOpacity>
    </Box>
  );
}

function Preview({ type }) {
  if (type === "pdf") {
    return (
      <Box style={styles.previewBox}>
        <FileText size={40} color="#F59E0B" />
      </Box>
    );
  }

  return (
    <Box style={styles.previewBox}>
      <Play size={30} color="white" />
    </Box>
  );
}

function CompletedBadge() {
  return (
    <Box
      flexDirection="row"
      alignItems="center"
      gap="s"
      backgroundColor="successLight"
      padding="m"
      borderRadius="l"
      marginTop="l"
    >
      <CheckCircle2 size={20} color="#10B981" />
      <Text style={{ color: "#065F46" }} fontWeight="bold">
        Leçon déjà complétée
      </Text>
    </Box>
  );
}

function CompletionFooter({ insets, completing, onPress }) {
  return (
    <Box
      position="absolute"
      bottom={0}
      left={0}
      right={0}
      backgroundColor="white"
      padding="m"
      borderTopWidth={1}
      borderTopColor="border"
      // style={{ paddingBottom: insets.bottom + 10 }}
    >
      <Button
        title="Marquer comme terminé"
        variant="primary"
        onPress={onPress}
        loading={completing}
        disabled={completing}
        icon={<CheckCircle2 size={20} color="white" />}
        iconPosition="right"
      />
    </Box>
  );
}

const styles = StyleSheet.create({
  card: {
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  linkButton: {
    backgroundColor: "#EF4444",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 20,
  },
  previewBox: {
    width: "100%",
    height: 180,
    borderRadius: 12,
    backgroundColor: "#EF4444",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
});
