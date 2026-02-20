import { db } from "@/components/lib/firebase";
import { MyLoader } from "@/components/ui/loader";
import { Box, Text } from "@/components/ui/theme";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import {
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileText,
  Play,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../../components/constants/authContext";

// ─────────────────────────────────────────
// 🎨 CONFIG PAR TYPE DE LEÇON
// ─────────────────────────────────────────
const TYPE_CONFIG = {
  text: {
    icon: (color) => <BookOpen size={18} color={color} />,
    label: "Lecture",
    color: "#2563EB",
    bg: "#EFF6FF",
  },
  video: {
    icon: (color) => <Play size={18} color={color} />,
    label: "Vidéo",
    color: "#EF4444",
    bg: "#FEF2F2",
  },
  pdf: {
    icon: (color) => <FileText size={18} color={color} />,
    label: "PDF",
    color: "#F59E0B",
    bg: "#FFFBEB",
  },
};

export default function ModuleContent() {
  const { user } = useAuth();
  const { trainingId, moduleId } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [lessons, setLessons] = useState([]);
  const [completedLessonIds, setCompletedLessonIds] = useState([]);
  const [moduleTitle, setModuleTitle] = useState("");
  const [loading, setLoading] = useState(true);

  // ─────────────────────────────────────────
  // 📡 CHARGER LES LEÇONS DU MODULE
  // ─────────────────────────────────────────
  useEffect(() => {
    if (!trainingId || !moduleId) return;

    const q = query(
      collection(db, "formations", trainingId, "modules", moduleId, "lessons"),
      orderBy("order", "asc"),
    );

    const unsubLessons = onSnapshot(q, (snapshot) => {
      setLessons(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    return () => unsubLessons();
  }, [trainingId, moduleId]);

  // ─────────────────────────────────────────
  // 📡 CHARGER LE TITRE DU MODULE
  // ─────────────────────────────────────────
  useEffect(() => {
    if (!trainingId || !moduleId) return;

    const moduleRef = doc(db, "formations", trainingId, "modules", moduleId);
    const unsubModule = onSnapshot(moduleRef, (snap) => {
      if (snap.exists()) setModuleTitle(snap.data().title);
    });

    return () => unsubModule();
  }, [trainingId, moduleId]);

  // ─────────────────────────────────────────
  // 📡 ÉCOUTER LES LEÇONS COMPLÉTÉES
  // ─────────────────────────────────────────
  useEffect(() => {
    if (!user?.uid || !trainingId) return;

    const q = query(
      collection(db, "userProgress"),
      where("userId", "==", user.uid),
      where("trainingId", "==", trainingId),
      where("moduleId", "==", moduleId),
    );

    const unsubProgress = onSnapshot(q, (snapshot) => {
      const ids = snapshot.docs.map((doc) => doc.data().lessonId);
      setCompletedLessonIds(ids);
    });

    return () => unsubProgress();
  }, [user?.uid, trainingId, moduleId]);

  if (loading) return <MyLoader message="Chargement des leçons..." />;

  // Progression du module
  const completedCount = completedLessonIds.length;
  const totalCount = lessons.length;
  const percentage =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

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
              {moduleTitle || "Leçons"}
            </Text>
          </Box>
        </Box>

        {/* Barre de progression du module */}
        {totalCount > 0 && (
          <Box marginTop="m">
            <Box
              flexDirection="row"
              justifyContent="space-between"
              marginBottom="xs"
            >
              <Text variant="caption" color="muted">
                {completedCount}/{totalCount} leçons terminées
              </Text>
              <Text variant="caption" color="primary" fontWeight="bold">
                {percentage}%
              </Text>
            </Box>
            {/* Barre de progression */}
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
                style={{ width: `${percentage}%` }}
              />
            </Box>
          </Box>
        )}
      </Box>

      {/* ─── LISTE DES LEÇONS ─── */}
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {lessons.length === 0 ? (
          <Box
            padding="xl"
            alignItems="center"
            backgroundColor="white"
            borderRadius="xl"
          >
            <BookOpen size={48} color="#D1D5DB" />
            <Text color="muted" marginTop="m" textAlign="center">
              Aucune leçon disponible pour ce module.
            </Text>
          </Box>
        ) : (
          lessons.map((lesson, index) => {
            const isCompleted = completedLessonIds.includes(lesson.id);
            const typeConfig = TYPE_CONFIG[lesson.type] || TYPE_CONFIG.text;

            return (
              <TouchableOpacity
                key={lesson.id}
                activeOpacity={0.8}
                onPress={() =>
                  router.push({
                    pathname:
                      "/(learner-tabs)/my-trainings/[moduleId]/lessons/[lessonId]",
                    params: {
                      lessonId: lesson.id,
                      moduleId,
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
                  {/* Icône type */}
                  <Box
                    width={44}
                    height={44}
                    borderRadius="m"
                    backgroundColor={isCompleted ? "#D1FAE5" : typeConfig.bg}
                    justifyContent="center"
                    alignItems="center"
                    marginRight="m"
                  >
                    {isCompleted ? (
                      <CheckCircle2 size={22} color="#10B981" />
                    ) : (
                      typeConfig.icon(typeConfig.color)
                    )}
                  </Box>

                  {/* Infos leçon */}
                  <Box flex={1}>
                    <Text
                      variant="body"
                      fontWeight="bold"
                      numberOfLines={1}
                      style={{ color: isCompleted ? "#6B7280" : "#111827" }}
                    >
                      {index + 1}. {lesson.title}
                    </Text>
                    <Box
                      flexDirection="row"
                      alignItems="center"
                      gap="m"
                      marginTop="xs"
                    >
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
                        <Text variant="caption" style={{ color: "#10B981" }}>
                          Terminée ✓
                        </Text>
                      )}
                    </Box>
                  </Box>

                  <ChevronRight size={20} color="#6B7280" />
                </Box>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
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
  cardCompleted: {
    opacity: 0.85,
    borderLeftWidth: 3,
    borderLeftColor: "#10B981",
  },
});
