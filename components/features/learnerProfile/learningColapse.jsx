import { Box, Text } from "@/components/ui/theme";
import { router } from "expo-router";
import {
    BookOpen,
    CheckCircle2,
    ChevronDown,
    ChevronRight,
    Circle,
} from "lucide-react-native";
import { StyleSheet, TouchableOpacity } from "react-native";
import { useLearnerProgress } from "./hooks/useLearnerProgress";

export default function TrainingCollapse({
  training,
  isExpanded,
  onToggle,
  userId,
}) {
  // ✅ On récupère les fonctions de calcul de ton hook
  const { modules, completedLessonIds, getModuleProgress, loading } =
    useLearnerProgress(userId, training.id);

  return (
    <Box marginBottom="m">
      <TouchableOpacity onPress={onToggle} activeOpacity={0.8}>
        <Box
          backgroundColor="white"
          padding="m"
          borderRadius="l"
          flexDirection="row"
          alignItems="center"
          style={[styles.card, isExpanded && styles.activeCard]}
        >
          <Box
            backgroundColor="secondaryBackground"
            padding="s"
            borderRadius="m"
            marginRight="m"
          >
            <BookOpen size={20} color="#2563EB" />
          </Box>
          <Box flex={1}>
            <Text variant="body" fontWeight="bold" numberOfLines={1}>
              {training.title}
            </Text>
            <Text variant="caption" color="muted">
              {loading ? "Chargement..." : `${modules.length} modules`}
            </Text>
          </Box>
          <ChevronDown
            size={20}
            color="#6B7280"
            style={{ transform: [{ rotate: isExpanded ? "180deg" : "0deg" }] }}
          />
        </Box>
      </TouchableOpacity>

      {isExpanded && !loading && (
        <Box
          backgroundColor="white"
          marginTop="xs"
          borderRadius="l"
          style={styles.moduleContainer}
        >
          {modules.map((module, index) => {
            // ✅ Utilisation de ta logique de progression par leçon
            // Note : Ton hook a besoin des leçons du module pour calculer le total.
            // Si tes modules Firestore contiennent déjà un tableau 'lessons', on le passe.
            const stats = getModuleProgress(module.lessons || []);
            const isFullyCompleted =
              stats.total > 0 && stats.completed === stats.total;

            return (
              <TouchableOpacity
                key={module.id}
                onPress={() =>
                  router.push({
                    pathname: "/(learner-tabs)/my-trainings/moduleContent",
                    params: { moduleId: module.id, trainingId: training.id },
                  })
                }
              >
                <Box
                  flexDirection="row"
                  alignItems="center"
                  padding="m"
                  borderBottomWidth={1}
                  borderBottomColor="secondaryBackground"
                >
                  <Box marginRight="m">
                    {isFullyCompleted ? (
                      <CheckCircle2 size={20} color="#10B981" /> // Vert si fini
                    ) : (
                      <Circle
                        size={20}
                        color={stats.completed > 0 ? "#2563EB" : "#D1D5DB"}
                      />
                    )}
                  </Box>

                  <Box flex={1}>
                    <Text
                      variant="body"
                      fontSize={14}
                      fontWeight={stats.completed > 0 ? "bold" : "normal"}
                    >
                      {module.title}
                    </Text>
                    {/* ✅ Affichage du compteur "X / Y leçons" */}
                    <Text variant="caption" color="muted">
                      {stats.completed} / {stats.total} leçon
                      {stats.total > 1 ? "s" : ""}
                    </Text>
                  </Box>

                  <Box flexDirection="row" alignItems="center">
                    {/* ✅ Badge de pourcentage */}
                    {stats.total > 0 && (
                      <Box
                        backgroundColor="secondaryBackground"
                        paddingHorizontal="s"
                        borderRadius="s"
                        marginRight="s"
                      >
                        <Text fontSize={10} color="primary" fontWeight="bold">
                          {stats.percentage}%
                        </Text>
                      </Box>
                    )}
                    <ChevronRight size={16} color="#D1D5DB" />
                  </Box>
                </Box>
              </TouchableOpacity>
            );
          })}
        </Box>
      )}
    </Box>
  );
}

const styles = StyleSheet.create({
  card: {
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  activeCard: { borderBottomLeftRadius: 0, borderBottomRightRadius: 0 },
  moduleContainer: {
    overflow: "hidden",
    borderLeftWidth: 4,
    borderLeftColor: "#2563EB",
    elevation: 1,
  },
});
