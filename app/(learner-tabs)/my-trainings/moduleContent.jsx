import { MyLoader } from "@/components/ui/loader";
import { Box, Text } from "@/components/ui/theme";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft, ExternalLink, FileText, Play } from "lucide-react-native";
import { Linking, ScrollView, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useModuleContent } from "../../../components/features/learnerProfile/hooks/useModuleContent";

export default function ModuleContent() {
  const { trainingId, moduleId } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { content, loading } = useModuleContent(trainingId, moduleId);

  console.log("content===>", content);

  if (loading) return <MyLoader message="Chargement du contenu..." />;

  return (
    <Box flex={1} backgroundColor="white">
      {/* HEADER MINIMALISTE */}
      <Box
        paddingHorizontal="m"
        paddingBottom="s"
        flexDirection="row"
        alignItems="center"
        style={{ paddingTop: insets.top + 10 }}
        borderBottomWidth={1}
        borderBottomColor="secondaryBackground"
      >
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft color="black" size={28} />
        </TouchableOpacity>
        <Box flex={1} marginLeft="s">
          <Text variant="body" fontWeight="bold" numberOfLines={1}>
            {content?.title || "Module"}
          </Text>
        </Box>
      </Box>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 50 }}>
        {/* TITRE DU MODULE */}
        <Text variant="hero" marginBottom="m">
          {content?.title}
        </Text>

        {/* SI VIDÉO PRÉSENTE */}
        {content?.videoUrl && (
          <TouchableOpacity
            onPress={() => Linking.openURL(content.videoUrl)}
            style={{ marginBottom: 20 }}
          >
            <Box
              height={200}
              backgroundColor="black"
              borderRadius="l"
              justifyContent="center"
              alignItems="center"
              overflow="hidden"
            >
              {/* Image de preview ou juste un bouton Play */}
              <Play color="white" size={50} fill="white" />
              <Box
                position="absolute"
                bottom={10}
                right={10}
                backgroundColor="rgba(0,0,0,0.6)"
                padding="xs"
                borderRadius="s"
              >
                <Text color="white" variant="caption">
                  Regarder la vidéo
                </Text>
              </Box>
            </Box>
          </TouchableOpacity>
        )}

        {/* TEXTE DU COURS */}
        <Box marginBottom="xl">
          <Text variant="body" lineHeight={26} color="black">
            {content?.description || content?.content}
          </Text>
        </Box>

        {/* PIÈCES JOINTES / RESSOURCES */}
        {content?.attachments?.length > 0 && (
          <Box marginTop="m">
            <Text variant="title" marginBottom="m" fontSize={18}>
              Ressources
            </Text>
            {content.attachments.map((file, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => Linking.openURL(file.url)}
              >
                <Box
                  flexDirection="row"
                  alignItems="center"
                  backgroundColor="secondaryBackground"
                  padding="m"
                  borderRadius="m"
                  marginBottom="s"
                >
                  <FileText size={20} color="#2563EB" />
                  <Text
                    flex={1}
                    marginLeft="s"
                    variant="body"
                    numberOfLines={1}
                  >
                    {file.name || "Document complémentaire"}
                  </Text>
                  <ExternalLink size={16} color="#6B7280" />
                </Box>
              </TouchableOpacity>
            ))}
          </Box>
        )}
      </ScrollView>

      {/* NAVIGATION BAS DE PAGE (Suivant / Précédent) */}
      <Box
        flexDirection="row"
        padding="m"
        borderTopWidth={1}
        borderTopColor="secondaryBackground"
        style={{ paddingBottom: insets.bottom + 10 }}
      >
        <TouchableOpacity
          style={{ flex: 1, alignItems: "center", padding: 12 }}
          onPress={() => router.back()}
        >
          <Text color="muted">Précédent</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            flex: 2,
            backgroundColor: "#2563EB",
            borderRadius: 10,
            padding: 12,
            alignItems: "center",
          }}
          onPress={() => {
            /* Logique pour passer au module suivant */
          }}
        >
          <Text color="white" fontWeight="bold">
            Module suivant
          </Text>
        </TouchableOpacity>
      </Box>
    </Box>
  );
}
