import { useAuth } from "@/components/constants/authContext";
import { MyLoader } from "@/components/ui/loader";
import { Box, Text } from "@/components/ui/theme";
import { BookOpen, Download, FileText, FolderOpen } from "lucide-react-native";
import {
  Linking,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useLearnerResources } from "../../components/features/learnerProfile/hooks/useLearnerRessources";

export default function LearnerResourcesScreen() {
  const { user } = useAuth();
  const { trainingsWithModules, loading } = useLearnerResources(user?.uid);

  if (loading) return <MyLoader message="Récupération des supports..." />;

  return (
    <Box flex={1} backgroundColor="secondaryBackground">
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
        {/* CORRECTION : On vérifie si le tableau trainingsWithModules a des données */}
        {trainingsWithModules.length > 0 ? (
          trainingsWithModules.map((training) => (
            <Box key={training.id} marginBottom="xl">
              {/* Titre de la Formation */}
              <Box flexDirection="row" alignItems="center" marginBottom="m">
                <BookOpen size={18} color="#2563EB" />
                <Text
                  variant="body"
                  fontWeight="bold"
                  marginLeft="s"
                  color="primary"
                >
                  {training.title}
                </Text>
              </Box>

              {/* Liste des Modules (Agissant comme ressources) */}
              <Box
                backgroundColor="white"
                borderRadius="l"
                padding="s"
                style={styles.card}
              >
                {training.modules.length === 0 ? (
                  <Box padding="xl" alignItems="center">
                    <FolderOpen size={32} color="#D1D5DB" />
                    <Text variant="caption" color="muted" marginTop="s">
                      Aucun module publié pour le moment.
                    </Text>
                  </Box>
                ) : (
                  training.modules.map((mod, index) => (
                    <ResourceItem
                      key={mod.id}
                      title={mod.title}
                      subtitle={`Module ${mod.order || index + 1}`}
                      type="Cours"
                      isLast={index === training.modules.length - 1}
                    />
                  ))
                )}
              </Box>
            </Box>
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
              Vous n'êtes inscrit à aucune formation.
            </Text>
          </Box>
        )}
      </ScrollView>
    </Box>
  );
}

function ResourceItem({ title, subtitle, type, url, isLast }) {
  const handleOpen = () => {
    if (url) Linking.openURL(url);
  };

  return (
    <TouchableOpacity onPress={handleOpen} activeOpacity={0.7}>
      <Box
        flexDirection="row"
        alignItems="center"
        padding="m"
        borderBottomWidth={isLast ? 0 : 1}
        borderBottomColor="secondaryBackground"
      >
        <Box
          width={40}
          height={40}
          borderRadius="m"
          backgroundColor="secondaryBackground"
          justifyContent="center"
          alignItems="center"
        >
          <FileText size={20} color="#6B7280" />
        </Box>
        <Box flex={1} marginLeft="m">
          <Text variant="body" numberOfLines={1} fontWeight="500">
            {title}
          </Text>
          <Text variant="caption" color="muted">
            {subtitle} • {type?.toUpperCase() ?? "PDF"}
          </Text>
        </Box>
        <Download size={20} color="#2563EB" />
      </Box>
    </TouchableOpacity>
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
