// components/OnboardingSlide.jsx
import { Box, ms, Text } from "@/components/ui/theme";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Dimensions, StyleSheet } from "react-native";

const { width, height } = Dimensions.get("window");

export function OnboardingSlide({ item }) {
  return (
    <Box flex={1} backgroundColor="background" width={width}>
      <Box flex={1}>
        {/* Image de fond */}
        <Image
          source={item.image}
          style={{ width, height: "100%", position: "absolute" }}
          contentFit="cover"
          transition={300}
        />

        {/* Overlay avec teinte bleutée pour effet glass */}
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          style={styles.overlay}
        />

        {/* Gradient bas de page */}
        <LinearGradient
          colors={["transparent", "rgba(5,10,30,0.85)"]}
          style={styles.gradient}
        />

        {/* Orbes lumineux décoratifs */}
        <Box style={styles.orb1} />
        <Box style={styles.orb2} />

        {/* CONTENEUR DE TEXTE — carte glassmorphique */}
        <Box
          flex={1}
          justifyContent="flex-end"
          alignItems="center"
          paddingHorizontal="xl"
          paddingBottom="xxl"
        >
          <Box style={styles.glassCard} width={width * 0.88} maxWidth={420}>
            {/* Badge catégorie */}
            {item.badge && (
              <Box style={styles.badge} alignSelf="flex-start" marginBottom="m">
                <Text style={styles.badgeText}>{item.badge}</Text>
              </Box>
            )}

            {/* Ligne décorative */}
            <Box style={styles.accentLine} marginBottom="m" />

            {/* TITRE */}
            <Text
              variant="hero"
              color="white"
              textAlign="left"
              numberOfLines={3}
              ellipsizeMode="tail"
              marginBottom="s"
              style={styles.title}
            >
              {item.title}
            </Text>

            {/* DESCRIPTION */}
            <Text
              variant="body"
              textAlign="left"
              numberOfLines={3}
              ellipsizeMode="tail"
              style={styles.description}
            >
              {item.description}
            </Text>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

const styles = StyleSheet.create({
  overlay: {
    backgroundColor: "rgba(8, 15, 40, 0.35)",
  },
  gradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.65,
  },
  // Orbes lumineux flous en arrière-plan
  orb1: {
    position: "absolute",
    top: height * 0.1,
    left: -60,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(99, 179, 237, 0.12)",
    // shadowColor et elevation pour Android
    elevation: 0,
  },
  orb2: {
    position: "absolute",
    top: height * 0.25,
    right: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(154, 117, 245, 0.10)",
  },
  // Carte glassmorphique principale
  glassCard: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    padding: 28,
    // Ombre portée douce
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 12,
  },
  badge: {
    backgroundColor: "rgba(99, 179, 237, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(99, 179, 237, 0.4)",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  badgeText: {
    color: "rgba(147, 210, 255, 0.95)",
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  accentLine: {
    width: 36,
    height: 3,
    borderRadius: 2,
    backgroundColor: "rgba(99, 179, 237, 0.8)",
  },
  title: {
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 12,
    letterSpacing: 0.4,
    lineHeight: 38,
  },
  description: {
    paddingBottom: ms(60),
    color: "rgba(210, 225, 255, 0.75)",
    letterSpacing: 0.3,
    lineHeight: 22,
  },
});
