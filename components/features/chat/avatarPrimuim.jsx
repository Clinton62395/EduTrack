import { Image } from "expo-image";
import { Crown, Sparkles } from "lucide-react-native";
import { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native"; // ✅ Animated de react-native uniquement
import {
  Circle,
  Defs,
  LinearGradient,
  RadialGradient,
  Stop,
  Svg,
  Text as SvgText,
} from "react-native-svg";
import { hs, ms, vs } from "../../ui/theme";

export function PremiumAvatar({ name, photoURL, isTrainer, isOwn }) {
  const initial = name?.charAt(0).toUpperCase() || "?";
  const size = 38;

  // ✅ Animated.Value de react-native (pas Reanimated) — compatible New Architecture
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isTrainer) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    }
    return () => glowAnim.stopAnimation();
  }, [isTrainer]);

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.3, 0.8, 0.3],
  });

  const glowScale = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.1],
  });

  if (photoURL) {
    return (
      <View
        style={[
          styles.avatarContainer,
          isTrainer && styles.avatarTrainerBorder,
        ]}
      >
        {isTrainer && (
          <Animated.View
            style={[
              styles.avatarGlow,
              { opacity: glowOpacity, transform: [{ scale: glowScale }] },
            ]}
          />
        )}
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
          {isTrainer && (
            <LinearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0%" stopColor="#F59E0B" />
              <Stop offset="100%" stopColor="#D97706" />
            </LinearGradient>
          )}
        </Defs>
        {isTrainer && (
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={size / 2 + 2}
            fill="url(#ringGrad)"
          />
        )}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={isTrainer ? size / 2 - 2 : size / 2}
          fill="url(#avatarGrad)"
        />
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
      {isTrainer && (
        <View style={styles.avatarTrainerBadge}>
          <Sparkles size={8} color="#FFFFFF" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  avatarContainer: {
    position: "relative",
    width: hs(38),
    height: vs(38),
  },

  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: ms(19),
    borderWidth: ms(2),
    borderColor: "rgba(255,255,255,0.2)",
  },

  avatarGlow: {
    position: "absolute",
    width: hs(46),
    height: vs(46),
    borderRadius: ms(23),
    backgroundColor: "#F59E0B",
    top: vs(-4),
    left: hs(-4),
  },

  avatarTrainerBorder: {
    borderWidth: 0,
  },

  trainerCrown: {
    position: "absolute",
    top: vs(-4),
    right: hs(-4),
    backgroundColor: "#FFFFFF",
    borderRadius: ms(10),
    padding: ms(2),
  },

  avatarTrainerBadge: {
    position: "absolute",
    bottom: vs(-2),
    right: hs(-2),
    backgroundColor: "#F59E0B",
    borderRadius: ms(8),
    padding: ms(2),
  },
});
