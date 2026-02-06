// components/OnboardingSlide.jsx
import { Box, Text } from "@/components/ui/theme";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

export function OnboardingSlide({ item }) {
  return (
    // ✅ AJOUT : width fixe = largeur de l'écran
    <Box
      flex={1}
      backgroundColor="background"
      width={width} // ← IMPORTANT : largeur fixe
    >
      <Box flex={1}>
        {/* Image de fond */}
        <Image
          source={item.image}
          style={{
            width: width, // ← Utiliser width au lieu de "100%"
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
          backgroundColor="overlayDark"
        />

        {/* Gradient pour profondeur */}
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.7)"]}
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: height * 0.5,
          }}
        />

        {/* CONTENEUR DE TEXTE */}
        <Box
          flex={1}
          justifyContent="center"
          alignItems="center"
          paddingHorizontal="xl"
        >
          <Box width={width * 1} maxWidth={400} alignItems="center">
            {/* TITRE */}
            <Text
              variant="hero"
              color="white"
              textAlign="center"
              numberOfLines={3}
              ellipsizeMode="tail"
              marginBottom="m"
              style={{
                textShadowColor: "rgba(0,0,0,0.8)",
                textShadowOffset: { width: 1, height: 2 },
                textShadowRadius: 10,
                letterSpacing: 0.6,
              }}
            >
              {item.title}
            </Text>

            {/* DESCRIPTION */}
            <Text
              variant="body"
              color="white"
              textAlign="center"
              lineHeight={24}
              numberOfLines={3}
              ellipsizeMode="tail"

              style={{
                textShadowColor: "rgba(0,0,0,0.6)",
                textShadowOffset: { width: 1, height: 1 },
                textShadowRadius: 6,
                letterSpacing: 0.5,
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
