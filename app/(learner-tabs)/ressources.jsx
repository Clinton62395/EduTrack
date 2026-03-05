import { useAuth } from "@/components/constants/authContext";
import { MyLoader } from "@/components/ui/loader";
import { Box, Text } from "@/components/ui/theme";
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  Download,
  FileText,
  FolderOpen,
  Layers,
} from "lucide-react-native";
import { useState } from "react";
import {
  Linking,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useLearnerResources } from "../../components/features/learnerProfile/hooks/useLearnerRessources";

// ─────────────────────────────────────────────
// Leçon téléchargeable
// ─────────────────────────────────────────────
function LessonItem({ lesson, isLast }) {
  const hasFile = !!lesson.fileUrl;

  const handleDownload = () => {
    if (hasFile) Linking.openURL(lesson.fileUrl);
  };

  return (
    <TouchableOpacity
      onPress={handleDownload}
      activeOpacity={hasFile ? 0.7 : 1}
      disabled={!hasFile}
    >
      <Box
        flexDirection="row"
        alignItems="center"
        paddingVertical="s"
        paddingHorizontal="m"
        borderBottomWidth={isLast ? 0 : 1}
        borderBottomColor="secondaryBackground"
      >
        {/* Icône fichier */}
        <Box
          width={34}
          height={34}
          borderRadius="m"
          backgroundColor={hasFile ? "primaryLight" : "secondaryBackground"}
          justifyContent="center"
          alignItems="center"
        >
          <FileText size={16} color={hasFile ? "#2563EB" : "#9CA3AF"} />
        </Box>

        {/* Titre + type */}
        <Box flex={1} marginLeft="m">
          <Text variant="body" numberOfLines={1} fontWeight="500">
            {lesson.title || "Leçon sans titre"}
          </Text>
          <Text variant="caption" color="muted">
            {lesson.type?.toUpperCase() ?? "COURS"}
            {lesson.duration ? ` • ${lesson.duration} min` : ""}
          </Text>
        </Box>

        {/* Bouton téléchargement ou indisponible */}
        {hasFile ? (
          <Download size={18} color="#2563EB" />
        ) : (
          <Text variant="caption" color="muted">
            —
          </Text>
        )}
      </Box>
    </TouchableOpacity>
  );
}

// ─────────────────────────────────────────────
// Module accordéon (expand/collapse)
// ─────────────────────────────────────────────
function ModuleAccordion({ module, moduleIndex }) {
  const [expanded, setExpanded] = useState(moduleIndex === 0); // 1er ouvert par défaut
  const lessonCount = module.lessons?.length ?? 0;

  return (
    <Box
      marginBottom="m"
      backgroundColor="white"
      borderRadius="l"
      style={styles.card}
    >
      {/* En-tête du module */}
      <TouchableOpacity
        onPress={() => setExpanded((v) => !v)}
        activeOpacity={0.8}
      >
        <Box
          flexDirection="row"
          alignItems="center"
          padding="m"
          borderBottomWidth={expanded ? 1 : 0}
          borderBottomColor="secondaryBackground"
        >
          <Box
            width={36}
            height={36}
            borderRadius="m"
            backgroundColor="secondaryBackground"
            justifyContent="center"
            alignItems="center"
          >
            <Layers size={18} color="#2563EB" />
          </Box>

          <Box flex={1} marginLeft="m">
            <Text variant="body" fontWeight="700" numberOfLines={1}>
              {module.title || `Module ${moduleIndex + 1}`}
            </Text>
            <Text variant="caption" color="muted">
              {lessonCount} leçon{lessonCount > 1 ? "s" : ""}
            </Text>
          </Box>

          {expanded ? (
            <ChevronDown size={18} color="#6B7280" />
          ) : (
            <ChevronRight size={18} color="#6B7280" />
          )}
        </Box>
      </TouchableOpacity>

      {/* Leçons (visibles si expanded) */}
      {expanded && (
        <>
          {lessonCount === 0 ? (
            <Box padding="l" alignItems="center">
              <FolderOpen size={28} color="#D1D5DB" />
              <Text variant="caption" color="muted" marginTop="s">
                Aucune leçon disponible
              </Text>
            </Box>
          ) : (
            module.lessons.map((lesson, i) => (
              <LessonItem
                key={lesson.id}
                lesson={lesson}
                isLast={i === module.lessons.length - 1}
              />
            ))
          )}
        </>
      )}
    </Box>
  );
}

// ─────────────────────────────────────────────
// Bloc formation
// ─────────────────────────────────────────────
function TrainingBlock({ training }) {
  return (
    <Box marginBottom="xl">
      {/* Titre formation */}
      <Box flexDirection="row" alignItems="center" marginBottom="m" gap="s">
        <BookOpen size={18} color="#2563EB" />
        <Text
          variant="body"
          fontWeight="bold"
          color="primary"
          numberOfLines={2}
        >
          {training.title}
        </Text>
      </Box>

      {training.modules.length === 0 ? (
        <Box
          backgroundColor="white"
          borderRadius="l"
          padding="xl"
          alignItems="center"
          style={styles.card}
        >
          <FolderOpen size={32} color="#D1D5DB" />
          <Text variant="caption" color="muted" marginTop="s">
            Aucun module publié pour le moment.
          </Text>
        </Box>
      ) : (
        training.modules.map((mod, i) => (
          <ModuleAccordion key={mod.id} module={mod} moduleIndex={i} />
        ))
      )}
    </Box>
  );
}

// ─────────────────────────────────────────────
// Écran principal
// ─────────────────────────────────────────────
export default function LearnerResourcesScreen() {
  const { user } = useAuth();
  const { trainingsWithModules, loading } = useLearnerResources(user?.uid);

  if (loading) return <MyLoader message="Récupération des supports..." />;

  return (
    <Box flex={1} backgroundColor="secondaryBackground">
      {/* Header */}
      <Box
        padding="l"
        marginTop="l"
        backgroundColor="white"
        borderBottomWidth={1}
        borderBottomColor="secondaryBackground"
      >
        <Text variant="title">Mes Ressources</Text>
        <Text variant="caption" color="muted">
          Documents et supports de cours
        </Text>
      </Box>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {trainingsWithModules.length > 0 ? (
          trainingsWithModules.map((training) => (
            <TrainingBlock key={training.id} training={training} />
          ))
        ) : (
          <Box
            backgroundColor="white"
            borderRadius="l"
            padding="xl"
            alignItems="center"
            style={styles.card}
          >
            <FolderOpen size={40} color="#D1D5DB" />
            <Text variant="body" color="muted" textAlign="center" marginTop="m">
              Vous n&apos;avez pas encore de formation
            </Text>
          </Box>
        )}
      </ScrollView>
    </Box>
  );
}

const styles = StyleSheet.create({
  card: {
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
});
