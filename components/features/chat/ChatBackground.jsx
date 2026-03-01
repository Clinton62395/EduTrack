import { useEffect, useRef } from "react";
import { Animated, Dimensions, Easing, StyleSheet, View } from "react-native";
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  RadialGradient,
  Rect,
  Stop,
} from "react-native-svg";

const { width, height } = Dimensions.get("window");

export function ChatBackground({ children, intensity = "medium" }) {
  const orb1Anim = useRef(new Animated.Value(0)).current;
  const orb2Anim = useRef(new Animated.Value(0)).current;
  const particlesAnim = useRef(new Animated.Value(0)).current;

  const intensityMap = {
    low: { opacity: 0.15 },
    medium: { opacity: 0.35 },
    high: { opacity: 0.5 },
  };

  const currentIntensity = intensityMap[intensity] || intensityMap.medium;

  useEffect(() => {
    Animated.parallel([
      Animated.loop(
        Animated.sequence([
          Animated.timing(orb1Anim, {
            toValue: 1,
            duration: 8000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(orb1Anim, {
            toValue: 0,
            duration: 8000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
      ),
      Animated.loop(
        Animated.sequence([
          Animated.timing(orb2Anim, {
            toValue: 1,
            duration: 10000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(orb2Anim, {
            toValue: 0,
            duration: 10000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
      ),
      Animated.loop(
        Animated.timing(particlesAnim, {
          toValue: 1,
          duration: 20000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ),
    ]).start();
  }, []);

  // ✅ On interpole le scale sur Animated.View — pas sur Circle SVG
  const orb1Scale = orb1Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.2],
  });

  const orb2Scale = orb2Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.3],
  });

  const particlesTranslateY = particlesAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -40],
  });

  return (
    <View style={styles.container}>
      {/* ── Grille de fond (statique — pas d'animation) ── */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Svg width="100%" height="100%">
          <Defs>
            <LinearGradient id="gridGradient" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0%" stopColor="#3B82F6" stopOpacity="0.05" />
              <Stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.05" />
            </LinearGradient>
          </Defs>
          {Array.from({ length: 15 }).map((_, i) => (
            <Rect
              key={`v-${i}`}
              x={`${i * 7}%`}
              y="0"
              width="0.5"
              height="100%"
              fill="url(#gridGradient)"
            />
          ))}
          {Array.from({ length: 25 }).map((_, i) => (
            <Rect
              key={`h-${i}`}
              x="0"
              y={`${i * 4}%`}
              width="100%"
              height="0.5"
              fill="url(#gridGradient)"
            />
          ))}
        </Svg>
      </View>

      {/* ── Orbe 1 — Animated.View autour du SVG statique ── */}
      {/* ✅ On anime le View, pas le Circle SVG directement */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.orbContainer,
          { top: "10%", left: "-10%" },
          { transform: [{ scale: orb1Scale }] },
        ]}
      >
        <Svg width={500} height={500}>
          <Defs>
            <RadialGradient id="orb1" cx="50%" cy="50%" r="50%">
              <Stop
                offset="0%"
                stopColor="#3B82F6"
                stopOpacity={currentIntensity.opacity}
              />
              <Stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Circle cx="250" cy="250" r="250" fill="url(#orb1)" />
        </Svg>
      </Animated.View>

      {/* ── Orbe 2 — même pattern ── */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.orbContainer,
          { top: "15%", right: "-15%" },
          { transform: [{ scale: orb2Scale }] },
        ]}
      >
        <Svg width={400} height={400}>
          <Defs>
            <RadialGradient id="orb2" cx="50%" cy="50%" r="50%">
              <Stop
                offset="0%"
                stopColor="#8B5CF6"
                stopOpacity={currentIntensity.opacity}
              />
              <Stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Circle cx="200" cy="200" r="200" fill="url(#orb2)" />
        </Svg>
      </Animated.View>

      {/* ── Orbes statiques (pas d'animation) ── */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Svg width="100%" height="100%">
          <Circle cx="10%" cy="65%" r="150" fill="#06B6D4" opacity={0.1} />
          <Circle cx="90%" cy="85%" r="200" fill="#6366F1" opacity={0.1} />
        </Svg>
      </View>

      {/* ── Particules flottantes ── */}
      {/* Animated.View anime le translateY — les Circle SVG sont statiques */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { transform: [{ translateY: particlesTranslateY }] },
        ]}
        pointerEvents="none"
      >
        <Svg width="100%" height="100%">
          {Array.from({ length: 20 }).map((_, i) => (
            <Circle
              key={i}
              cx={`${(i * 13) % 100}%`}
              cy={`${(i * 17) % 100}%`}
              r={1.5}
              fill="white"
              opacity={0.2}
            />
          ))}
        </Svg>
      </Animated.View>

      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#070B14",
  },
  // Conteneur positionné pour les orbes animés
  orbContainer: {
    position: "absolute",
    pointerEvents: "none",
  },
});
