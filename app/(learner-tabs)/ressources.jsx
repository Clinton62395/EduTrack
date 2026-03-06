import { useAuth } from "@/components/constants/authContext";
import { MyLoader } from "@/components/ui/loader";
import { Box, Text } from "@/components/ui/theme";
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  FolderOpen,
  Layers,
} from "lucide-react-native";
import { useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { useLearnerResources } from "../../components/features/learnerProfile/hooks/useLearnerRessources";
import { LessonItem } from "../../components/features/learnerProfile/ressourcesAction/lessonsItems";

export default function LearnerResourcesScreen() {
  const { user } = useAuth();
  const {
    trainingsWithModules,
    loading,
    downloadFile,
    downloadingIds,
    getLocalUri,
  } = useLearnerResources(user?.uid);

  if (loading) return <MyLoader message="Synchronisation de vos supports..." />;

  return (
    <Box flex={1} backgroundColor="secondaryBackground">
      {/* HEADER PROFESSIONNEL */}
      <Box
        padding="l"
        paddingTop="xl"
        backgroundColor="white"
        borderBottomWidth={1}
        borderBottomColor="secondaryBackground"
      >
        <Text variant="title" fontWeight="bold">
          Bibliothèque
        </Text>
        <Text variant="caption" color="muted">
          Accédez à vos supports de cours même hors-ligne
        </Text>
      </Box>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {trainingsWithModules.length > 0 ? (
          trainingsWithModules.map((training) => (
            <TrainingGroup
              key={training.id}
              training={training}
              downloadFile={downloadFile}
              downloadingIds={downloadingIds}
              getLocalUri={getLocalUri}
            />
          ))
        ) : (
          <EmptyState />
        )}
      </ScrollView>
    </Box>
  );
}

// Groupement par Formation
function TrainingGroup({ training, ...props }) {
  return (
    <Box marginBottom="xl">
      <Box flexDirection="row" alignItems="center" marginBottom="m" gap="s">
        <BookOpen size={20} color="#2563EB" />
        <Text variant="body" fontWeight="bold" color="primary" flex={1}>
          {training.title}
        </Text>
      </Box>
      {training.modules.map((mod, i) => (
        <ModuleAccordion key={mod.id} module={mod} index={i} {...props} />
      ))}
    </Box>
  );
}

// Accordéon de Module
function ModuleAccordion({
  module,
  index,
  downloadFile,
  downloadingIds,
  getLocalUri,
}) {
  const [expanded, setExpanded] = useState(index === 0);
  const lessons = module.lessons || [];

  return (
    <Box
      marginBottom="m"
      backgroundColor="white"
      borderRadius="l"
      style={styles.card}
    >
      <TouchableOpacity
        onPress={() => setExpanded(!expanded)}
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
            <Text variant="body" fontWeight="700">
              {module.title}
            </Text>
            <Text variant="caption" color="muted">
              {lessons.length} ressource(s)
            </Text>
          </Box>
          {expanded ? (
            <ChevronDown size={18} color="#6B7280" />
          ) : (
            <ChevronRight size={18} color="#6B7280" />
          )}
        </Box>
      </TouchableOpacity>

      {expanded && (
        <Box>
          {lessons.length === 0 ? (
            <Box padding="m" alignItems="center">
              <Text variant="caption" color="muted">
                Aucun fichier
              </Text>
            </Box>
          ) : (
            lessons.map((lesson, i) => (
              <LessonItem
                key={lesson.id}
                lesson={lesson}
                isLast={i === lessons.length - 1}
                onDownload={downloadFile}
                isDownloading={downloadingIds.includes(lesson.id)}
                getLocalUri={getLocalUri}
              />
            ))
          )}
        </Box>
      )}
    </Box>
  );
}

function EmptyState() {
  return (
    <Box padding="xl" alignItems="center" marginTop="xl">
      <FolderOpen size={48} color="#D1D5DB" />
      <Text variant="body" color="muted" marginTop="m">
        Aucune ressource disponible pour le moment.
      </Text>
    </Box>
  );
}

const styles = StyleSheet.create({
  card: {
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
});
