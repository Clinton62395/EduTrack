import { Snack } from "@/components/ui/snackbar";
import { Box, Text } from "@/components/ui/theme";
import {
  Download,
  FileText,
  Link,
  Play,
  Plus,
  Trash2,
} from "lucide-react-native";
import { useState } from "react";
import { Linking, StyleSheet, TouchableOpacity } from "react-native";
import AddResourceModal from "../../../app/(modal)/trainerModal/ressourcesModal";
import { useResources } from "./hooks/useRessources";

// ─────────────────────────────────────────
// 🎨 CONFIG PAR TYPE
// ─────────────────────────────────────────
const TYPE_CONFIG = {
  pdf: {
    icon: <FileText size={20} color="warning" />,
    bg: "warningBackground",
  },
  video: { icon: <Play size={20} color="danger" />, bg: "secondaryBackground" },
  link: { icon: <Link size={20} color="primary" />, bg: "infoBackground" },
};

/**
 * Section de gestion des ressources dans TrainingDetailScreen.
 * À intégrer directement dans le JSX du trainer.
 *
 * @param {string} formationId
 * @param {Array} resources - resources du document formation (formation.resources)
 */
export function ResourcesSection({ formationId, resources = [] }) {
  const { addResource, deleteResource, loading } = useResources(formationId);
  const [modalVisible, setModalVisible] = useState(false);
  const [snack, setSnack] = useState({
    visible: false,
    message: "",
    type: "success",
  });

  const showSnack = (message, type = "success") =>
    setSnack({ visible: true, message, type });

  const handleAdd = async (data) => {
    const success = await addResource(data);
    if (success) {
      showSnack("Ressource ajoutée ✓", "success");
      setModalVisible(false);
    } else {
      showSnack("Erreur lors de l'ajout", "error");
    }
  };

  const handleDelete = async (resource) => {
    const success = await deleteResource(resource);
    if (success) showSnack("Ressource supprimée", "success");
  };

  return (
    <Box marginTop="xl">
      {/* ── Titre + bouton ajout ── */}
      <Box
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        marginBottom="m"
      >
        <Text variant="body" fontWeight="bold">
          Ressources
        </Text>
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          style={styles.addButton}
        >
          <Plus size={18} color="white" />
        </TouchableOpacity>
      </Box>

      {/* ── Liste des ressources ── */}
      {resources.length === 0 ? (
        <Box
          padding="l"
          backgroundColor="secondaryBackground"
          borderRadius="l"
          alignItems="center"
        >
          <Text variant="caption" color="muted">
            Aucune ressource ajoutée.
          </Text>
        </Box>
      ) : (
        resources.map((resource, index) => {
          const config = TYPE_CONFIG[resource.type] || TYPE_CONFIG.link;
          return (
            <Box
              key={index}
              backgroundColor="white"
              borderRadius="l"
              padding="m"
              marginBottom="s"
              flexDirection="row"
              alignItems="center"
              style={styles.card}
            >
              {/* Icône type */}
              <Box
                width={40}
                height={40}
                borderRadius="m"
                backgroundColor={config.bg}
                justifyContent="center"
                alignItems="center"
                marginRight="m"
              >
                {config.icon}
              </Box>

              {/* Nom + type */}
              <Box flex={1}>
                <Text variant="body" numberOfLines={1}>
                  {resource.name}
                </Text>
                <Text variant="caption" color="muted">
                  {resource.type?.toUpperCase() ?? "FICHIER"}
                </Text>
              </Box>

              {/* Actions */}
              <Box flexDirection="row" gap="m" alignItems="center">
                <TouchableOpacity
                  onPress={() => Linking.openURL(resource.url)}
                  hitSlop={10}
                >
                  <Download size={18} color="#2563EB" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleDelete(resource)}
                  hitSlop={10}
                >
                  <Trash2 size={18} color="#EF4444" />
                </TouchableOpacity>
              </Box>
            </Box>
          );
        })
      )}

      {/* ── Modal ── */}
      <AddResourceModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleAdd}
        loading={loading}
      />

      {/* ── Snack ── */}
      <Snack
        visible={snack.visible}
        message={snack.message}
        type={snack.type}
        onDismiss={() => setSnack((prev) => ({ ...prev, visible: false }))}
      />
    </Box>
  );
}

const styles = StyleSheet.create({
  addButton: {
    backgroundColor: "#2563EB",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
});
