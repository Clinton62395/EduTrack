// components/NotFoundScreenLottie.jsx
import { Box, Button, Text } from "@/components/ui/theme";
import { useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import { ArrowLeft, Home, RefreshCw } from "lucide-react-native";
import { useEffect, useRef } from "react";
import { Dimensions, StyleSheet } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,

  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function NotFoundScreenLottie() {
  const router = useRouter();
  const lottieRef = useRef(null);

  // Animations
  const containerScale = useSharedValue(0.8);
  const containerOpacity = useSharedValue(0);
  const buttonScale = useSharedValue(0);
  const glowAnim = useSharedValue(0);

  useEffect(() => {
    // Animation d'entrée
    containerScale.value = withSpring(1, {
      damping: 12,
      stiffness: 100,
    });

    containerOpacity.value = withDelay(100, withTiming(1, { duration: 600 }));

    // Animation des boutons avec décalage
    buttonScale.value = withDelay(500, withSpring(1, { damping: 15 }));

    // Animation de brillance répétée
    glowAnim.value = withSequence(
      withDelay(
        1000,
        withTiming(1, {
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
        }),
      ),
      withTiming(0, { duration: 1500 }),
    );

    // Jouer l'animation Lottie
    if (lottieRef.current) {
      setTimeout(() => {
        lottieRef.current?.play();
      }, 300);
    }

    // Répéter l'animation de brillance
    const interval = setInterval(() => {
      glowAnim.value = withSequence(
        withTiming(1, { duration: 1500 }),
        withTiming(0, { duration: 1500 }),
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: containerScale.value }],
    opacity: containerOpacity.value,
  }));

  const buttonContainerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
    opacity: containerOpacity.value,
  }));

  const glowStyle = useAnimatedStyle(() => ({
    position: "absolute",
    top: "25%",
    alignSelf: "center",
    width: SCREEN_WIDTH * 0.7,
    height: SCREEN_WIDTH * 0.7,
    borderRadius: SCREEN_WIDTH * 0.35,
    backgroundColor: `rgba(37, 99, 235, ${glowAnim.value * 0.15})`,
    transform: [{ scale: 1 + glowAnim.value * 0.2 }],
  }));

  const handleRetry = () => {
    // Animation de rebond sur le bouton
    buttonScale.value = withSequence(
      withSpring(0.9, { damping: 3 }),
      withSpring(1, { damping: 15 }),
    );

    // Rejouer l'animation Lottie
    if (lottieRef.current) {
      lottieRef.current.play();
    }
  };

  return (
    <Box
      flex={1}
      backgroundColor="background"
      alignItems="center"
      justifyContent="center"
      padding="xl"
    >
      {/* Effet de glow animé */}
      <Animated.View style={glowStyle} />

      <Animated.View style={[styles.lottieContainer, containerStyle]}>
        {/* Animation Lottie 404 */}
        <LottieView
          ref={lottieRef}
          source={require("../assets/images/404.json")} // Crée ou télécharge un JSON Lottie
          style={styles.lottie}
          autoPlay
          loop
        />

        {/* Ou utiliser une image locale */}
        {/* <Image source={require('@/assets/images/404.png')} style={styles.fallbackImage} /> */}
      </Animated.View>

      <Animated.View style={[styles.lottieTextContainer, containerStyle]}>
        <Text variant="title" textAlign="center" marginBottom="s">
          Oups ! Page introuvable
        </Text>

        <Text variant="body" color="muted" textAlign="center" lineHeight={24}>
          La page que vous cherchez semble s'être égarée dans le cyberespace.
        </Text>
      </Animated.View>

      <Animated.View
        style={[styles.lottieButtonContainer, buttonContainerStyle]}
      >
        <Box
          flexDirection="row"
          gap="m"
          justifyContent="center"
          flexWrap="wrap"
        >
          <Button
            title="Revenir en arrière"
            onPress={() =>
              router.canGoBack()
                ? router.back()
                : router.replace("/(onboarding)")
            }
            variant="outline"
            icon={<ArrowLeft size={20} color="#6B7280" />}
            iconPosition="left"
            style={{ minWidth: 160 }}
          />

          <Button
            title="Page d'accueil"
            onPress={() => router.replace("/(onboarding)")}
            icon={<Home size={20} color="white" />}
            iconPosition="left"
            style={{ minWidth: 160 }}
          />
        </Box>

        <Button
          title="Réessayer"
          onPress={handleRetry}
          variant="secondary"
          icon={<RefreshCw size={20} color="white" />}
          iconPosition="left"
          marginTop="l"
          style={{ alignSelf: "center" }}
        />
      </Animated.View>
    </Box>
  );
}

const styles = StyleSheet.create({
  lottieContainer: {
    width: 300,
    height: 300,
    marginBottom: 30,
  },
  lottie: {
    width: "100%",
    height: "100%",
  },
  fallbackImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  lottieTextContainer: {
    alignItems: "center",
    marginBottom: 40,
    maxWidth: 400,
  },
  lottieButtonContainer: {
    width: "100%",
    maxWidth: 400,
  },
});
