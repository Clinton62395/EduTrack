import { Image } from "expo-image";
import { Crown, Sparkles } from "lucide-react-native";
import { StyleSheet, View } from "react-native";
import {
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
} from "react-native-reanimated";
import {
    Circle,
    Defs,
    LinearGradient,
    RadialGradient,
    Stop,
    Svg,
    Text as SvgText,
} from "react-native-svg";

/**
 * ── Avatar Premium avec animations et effets
 */
export function PremiumAvatar({ name, photoURL, isTrainer, isOwn }) {
  const initial = name?.charAt(0).toUpperCase() || "?";
  const size = 38;
  const glowAnim = useSharedValue(0);

  // Animation de glow pour les trainers
  if (isTrainer) {
    glowAnim.value = withRepeat(withTiming(1, { duration: 2000 }), -1, true);
  }

  const glowStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(glowAnim.value, [0, 0.5, 1], [0.3, 0.8, 0.3]),
      transform: [{ scale: 1 + glowAnim.value * 0.1 }],
    };
  });

  if (photoURL) {
    return (
      <View
        style={[
          styles.avatarContainer,
          isTrainer && styles.avatarTrainerBorder,
        ]}
      >
        {isTrainer && <Animated.View style={[styles.avatarGlow, glowStyle]} />}
        <Image
          source={{ uri: photoURL }}
          style={[styles.avatarImage, { width: size, height: size }]}
        />
        {isTrainer && (
          <View style={styles.trainerCrown}>
            <Crown size={12} color="#F59E0B" />
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={styles.avatarContainer}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Defs>
          {/* Dégradé premium */}
          <RadialGradient id="avatarGrad" cx="30%" cy="30%" r="70%">
            <Stop
              offset="0%"
              stopColor={isOwn ? "#60A5FA" : isTrainer ? "#C084FC" : "#94A3B8"}
            />
            <Stop
              offset="100%"
              stopColor={isOwn ? "#2563EB" : isTrainer ? "#7C3AED" : "#64748B"}
            />
          </RadialGradient>

          {/* Bague pour trainer */}
          {isTrainer && (
            <LinearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0%" stopColor="#F59E0B" />
              <Stop offset="100%" stopColor="#D97706" />
            </LinearGradient>
          )}
        </Defs>

        {/* Bague trainer */}
        {isTrainer && (
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={size / 2 + 2}
            fill="url(#ringGrad)"
          />
        )}

        {/* Cercle principal */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={isTrainer ? size / 2 - 2 : size / 2}
          fill="url(#avatarGrad)"
        />

        {/* Initiale */}
        <SvgText
          x={size / 2}
          y={size / 2 + 5}
          textAnchor="middle"
          fontSize="16"
          fontWeight="bold"
          fill="white"
        >
          {initial}
        </SvgText>
      </Svg>

      {/* Badge trainer */}
      {isTrainer && (
        <View style={styles.avatarTrainerBadge}>
          <Sparkles size={8} color="#FFFFFF" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // Avatar
  avatarContainer: {
    position: "relative",
    width: 38,
    height: 38,
  },
  avatarImage: {
    borderRadius: 19,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.2)",
  },
  avatarGlow: {
    position: "absolute",
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#F59E0B",
    top: -4,
    left: -4,
  },
  avatarTrainerBorder: {
    borderWidth: 0,
  },
  trainerCrown: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 2,
  },
  avatarTrainerBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    backgroundColor: "#F59E0B",
    borderRadius: 8,
    padding: 2,
  },
});
