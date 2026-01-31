// components/OnboardingSlide.jsx - VERSION CORRIGÉE
import { Box, Text } from "@/components/ui/theme";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

export function OnboardingSlide({ item }) {
  return (
    <Box flex={1} backgroundColor="background">
      <Box flex={1}>
        {/* Image de fond */}
        <Image
          source={item.image}
          style={{
            width: "100%",
            height: "100%",
            position: "absolute",
          }}
          contentFit="cover"
          transition={200}
        />

        {/* Overlay sombre */}
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          backgroundColor="overlayDark" // ← Couleur de fond
        />

        {/* Gradient pour profondeur */}
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.7)"]}
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: height * 0.5, // ← Plus de hauteur pour le texte
          }}
        />

        {/* CONTENEUR DE TEXTE AVEC LIMITE */}
        <Box
          flex={1}
          justifyContent="center"
          alignItems="center"
          paddingHorizontal="xl" // ← Padding sur les côtés
        >
          {/* Conteneur pour le texte avec largeur limitée */}
          <Box
            width={width * 0.9} // ← 90% de la largeur de l'écran
            maxWidth={400} // ← Largeur maximum
            alignItems="center"
          >
            {/* TITRE - CENTRÉ ET SANS MARGIN LEFT */}
            <Text
              variant="hero"
              color="white"
              textAlign="center"
              marginBottom="m"
              style={{
                textShadowColor: "overlayDark",
                textShadowOffset: { width: 1, height: 2 },
                textShadowRadius: 10,
                // PAS de marginLeft ici !
              }}
            >
              {item.title}
            </Text>

            {/* DESCRIPTION - AVEC WRAP */}
            <Text
              variant="body"
              color="white"
              textAlign="center"
              lineHeight={24}
              style={{
                textShadowColor: "overlaylight",
                textShadowOffset: { width: 1, height: 1 },
                textShadowRadius: 6,
                // Propriétés pour éviter le débordement :
                flexWrap: "wrap",
                overflow: "hidden",
              }}
            >
              {item.description}
            </Text>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
