// TrainingDetailScreen.tsx (version corrigée)
import { copyToClipboard  , shareFormation } from "@/components/helpers/actionButton";
import { db } from "@/components/lib/firebase";
import AddModuleModal from "@/components/modal/moduleModal";
import { Box, Button, Text } from "@/components/ui/theme";
import { useModules } from "@/hooks/useModule";
import { useLocalSearchParams, useRouter } from "expo-router";
import { doc, onSnapshot } from "firebase/firestore";
import {
  BookOpen,
  ChevronLeft,
  Plus,
  Share2,
  Users,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TrainingDetailScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [formation, setFormation] = useState(null);
  const [loading, setLoading] = useState(true);
  const { modules, addModule, deleteModule } = useModules(formation?.id);

  // Fonction de gestion
  const handleCreateModule = async (title) => {
    await addModule(title);
    setModalVisible(false);
  };

  useEffect(() => {
    if (!id) return;

    const unsubscribe = onSnapshot(
      doc(db, "formations", id.toString()),
      (doc) => {
        if (doc.exists()) {
          const data = { id: doc.id, ...doc.data() };
          console.log("📌 Formation chargée:", data); // Pour debug
          console.log("🖼️ URL de l'image:", data.coverImage); // Pour debug
          setFormation(data);
        }
        setLoading(false);
      },
      (error) => {
        console.error("❌ Erreur Firestore:", error);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [id]);

  if (loading) {
    return (
      <Box flex={1} justifyContent="center" alignItems="center">
        <ActivityIndicator size="large" color="#2563EB" />
      </Box>
    );
  }

  if (!formation) {
    return (
      <Box flex={1} justifyContent="center" alignItems="center">
        <Text>Formation introuvable</Text>
      </Box>
    );
  }

  return (
    <Box flex={1} backgroundColor="secondaryBackground">
      {/* HEADER AVEC IMAGE */}
      <Box height={250} width="100%" backgroundColor="gray">
        {formation.coverImage ? (
          <Image
            source={{ uri: formation.coverImage }}
            style={{ width: "100%", height: "100%" }}
            resizeMode="cover"
            onError={(error) => {
              console.error(
                "❌ Erreur de chargement d'image:",
                error.nativeEvent.error,
              );
            }}
            onLoad={() => {
              console.log("✅ Image chargée avec succès");
            }}
          />
        ) : (
          <Box
            flex={1}
            justifyContent="center"
            alignItems="center"
            backgroundColor="secondaryBackground"
          >
            <BookOpen size={48} color="#6B7280" />
            <Text variant="caption" color="muted" marginTop="s">
              Aucune image
            </Text>
          </Box>
        )}

        {/* BOUTON RETOUR */}
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            position: "absolute",
            top: insets.top + 10,
            left: 20,
            backgroundColor: "rgba(0,0,0,0.5)",
            borderRadius: 20,
            padding: 8,
          }}
        >
          <ChevronLeft color="white" size={24} />
        </TouchableOpacity>
      </Box>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <Box
          padding="l"
          marginTop="l"
          backgroundColor="white"
          borderTopLeftRadius="xl"
          borderTopRightRadius="xl"
        >
          {/* TITRE ET BADGE STATUT */}
          <Box
            flexDirection="row"
            justifyContent="space-between"
            alignItems="flex-start"
          >
            <Box flex={1}>
              <Text variant="title" marginBottom="s">
                {formation.title}
              </Text>
              <Box
                backgroundColor="secondaryBackground"
                paddingHorizontal="s"
                paddingVertical="xs"
                borderRadius="s"
                alignSelf="flex-start"
              >
                <Text variant="caption" color="primary">
                  {formation.category}
                </Text>
              </Box>
            </Box>
            <TouchableOpacity onPress={() => shareFormation(formation.title, formation.invitationCode)}>
              <Share2 color="#2563EB" size={24} />
            </TouchableOpacity>
          </Box>

          {/* CODE D'INVITATION (IMPORTANT) */}
          <Box
            backgroundColor="secondaryBackground"
            padding="m"
            borderRadius="l"
            marginTop="l"
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Text variant="caption" color="muted">
                Code d&apos;invitation
              </Text>
              <Text variant="body" fontWeight="bold" color="primary">
                {formation.invitationCode}
              </Text>
            </Box>
            <Button
              title="Copier"
              variant="outline"
              size="small"
              onPress={() => copyToClipboard(formation.invitationCode)}
            />
          </Box>

          {/* STATS RAPIDES */}
          <Box flexDirection="row" gap="m" marginTop="l">
            <StatCard
              icon={<Users size={20} color="#6B7280" />}
              label="Élèves"
              value={`${formation.currentLearners}/${formation.maxLearners}`}
            />
            <StatCard
              icon={<BookOpen size={20} color="#6B7280" />}
              label="Modules"
              value={modules?.length || "0"}
            />
          </Box>

          {/* DESCRIPTION */}
          <Box marginTop="xl">
            <Text variant="body" fontWeight="bold" marginBottom="s">
              À propos de la formation
            </Text>
            <Text variant="body" color="muted" lineHeight={22}>
              {formation.description || "Aucune description fournie."}
            </Text>
          </Box>

          {/* SECTION MODULES */}
          <Box
            marginTop="xl"
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Text variant="body" fontWeight="bold">
              Programme (Modules)
            </Text>
            <TouchableOpacity onPress={() => setModalVisible(true)}>
              <Plus size={20} color="#2563EB" />
            </TouchableOpacity>
          </Box>

          {modules && modules.length > 0 ? (
            <Box marginTop="m" gap="s">
              {modules.map((module, index) => (
                <Box
                  key={module.id}
                  padding="m"
                  backgroundColor="secondaryBackground"
                  borderRadius="m"
                  flexDirection="row"
                  alignItems="center"
                  gap="m"
                >
                  <Box
                    backgroundColor="primary"
                    width={32}
                    height={32}
                    borderRadius="rounded"
                    justifyContent="center"
                    alignItems="center"
                  >
                    <Text variant="body" color="white" fontWeight="bold">
                      {index + 1}
                    </Text>
                  </Box>
                  <Text variant="body" flex={1}>
                    {module.title}
                  </Text>
                </Box>
              ))}
            </Box>
          ) : (
            <Box
              marginTop="m"
              padding="l"
              borderWidth={1}
              borderColor="border"
              borderRadius="l"
              borderStyle="dashed"
              alignItems="center"
            >
              <Text variant="caption" color="muted">
                Aucun module créé pour le moment
              </Text>
              <Button
                title="Ajouter le premier module"
                variant="ghost"
                marginTop="s"
                onPress={() => setModalVisible(true)}
              />
            </Box>
          )}
        </Box>
      </ScrollView>

      {/* BARRE D'ACTION FIXE EN BAS */}
      <Box
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        backgroundColor="white"
        padding="m"
        borderTopWidth={1}
        borderTopColor="border"
        flexDirection="row"
        gap="m"
        style={{ paddingBottom: insets.bottom + 10 }}
      >
        <Button flex={1} title="Gérer les élèves" variant="outline" />
        <Button flex={1} title="Modifier" variant="secondary" />
      </Box>

      {/* MODAL AJOUT DE MODULE */}
      <AddModuleModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onAdd={handleCreateModule}
        loading={loading}
      />
    </Box>
  );
}

// Composant interne pour les stats
function StatCard({ icon, label, value }) {
  return (
    <Box
      flex={1}
      padding="m"
      backgroundColor="secondaryBackground"
      borderRadius="m"
      alignItems="center"
    >
      {icon}
      <Text variant="caption" color="muted" marginTop="xs">
        {label}
      </Text>
      <Text variant="body" fontWeight="bold">
        {value}
      </Text>
    </Box>
  );
}
