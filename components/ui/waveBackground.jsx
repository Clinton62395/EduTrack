import { useEffect, useRef } from "react";
import { Animated, Dimensions, Easing, StyleSheet, View } from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function WaveBackground({
  primaryColor = "#2563EB",
  secondaryColor = "#1D4ED8",
  tertiaryColor = "#3B82F6",
}) {
  const wave1 = useRef(new Animated.Value(0)).current;
  const wave2 = useRef(new Animated.Value(0)).current;
  const wave3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Wave 1 — la plus rapide
    Animated.loop(
      Animated.sequence([
        Animated.timing(wave1, {
          toValue: 1,
          duration: 4000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(wave1, {
          toValue: 0,
          duration: 4000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // Wave 2 — décalée
    Animated.loop(
      Animated.sequence([
        Animated.timing(wave2, {
          toValue: 1,
          duration: 6000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(wave2, {
          toValue: 0,
          duration: 6000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // Wave 3 — la plus lente
    Animated.loop(
      Animated.sequence([
        Animated.timing(wave3, {
          toValue: 1,
          duration: 9000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(wave3, {
          toValue: 0,
          duration: 9000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    ).start();

    return () => {
      wave1.stopAnimation();
      wave2.stopAnimation();
      wave3.stopAnimation();
    };
  }, []);

  // Translations verticales des vagues
  const translateY1 = wave1.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -30],
  });
  const translateY2 = wave2.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -20],
  });
  const translateY3 = wave3.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -15],
  });

  // Scale horizontal pour effet de vague
  const scaleX1 = wave1.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.05, 1],
  });
  const scaleX2 = wave2.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1.02, 0.98, 1.02],
  });
  const scaleX3 = wave3.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.98, 1.03, 0.98],
  });

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      {/* Wave 3 — arrière-plan */}
      <Animated.View
        style={[
          s.wave,
          s.wave3,
          {
            backgroundColor: tertiaryColor,
            transform: [{ translateY: translateY3 }, { scaleX: scaleX3 }],
          },
        ]}
      />

      {/* Wave 2 — milieu */}
      <Animated.View
        style={[
          s.wave,
          s.wave2,
          {
            backgroundColor: secondaryColor,
            transform: [{ translateY: translateY2 }, { scaleX: scaleX2 }],
          },
        ]}
      />

      {/* Wave 1 — premier plan */}
      <Animated.View
        style={[
          s.wave,
          s.wave1,
          {
            backgroundColor: primaryColor,
            transform: [{ translateY: translateY1 }, { scaleX: scaleX1 }],
          },
        ]}
      />
    </View>
  );
}

const s = StyleSheet.create({
  wave: {
    position: "absolute",
    width: SCREEN_WIDTH * 1.5,
    left: -SCREEN_WIDTH * 0.25,
    // Forme de vague via borderRadius asymétrique
    borderTopLeftRadius: SCREEN_WIDTH,
    borderTopRightRadius: SCREEN_WIDTH * 0.8,
  },
  wave1: {
    height: SCREEN_HEIGHT * 0.55,
    bottom: -SCREEN_HEIGHT * 0.1,
    opacity: 0.18,
    borderTopLeftRadius: SCREEN_WIDTH * 0.9,
    borderTopRightRadius: SCREEN_WIDTH * 1.1,
  },
  wave2: {
    height: SCREEN_HEIGHT * 0.5,
    bottom: -SCREEN_HEIGHT * 0.12,
    opacity: 0.12,
    borderTopLeftRadius: SCREEN_WIDTH * 1.1,
    borderTopRightRadius: SCREEN_WIDTH * 0.85,
  },
  wave3: {
    height: SCREEN_HEIGHT * 0.45,
    bottom: -SCREEN_HEIGHT * 0.14,
    opacity: 0.08,
    borderTopLeftRadius: SCREEN_WIDTH * 0.85,
    borderTopRightRadius: SCREEN_WIDTH * 1.0,
  },
});
