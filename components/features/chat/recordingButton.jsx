import { Mic } from "lucide-react-native";
import { useEffect } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import Svg, { Circle } from "react-native-svg";

// ─────────────────────────────────────────
// 🧩 MIC BUTTON
// Usage:
// <MicButton
//   onToggleVoice={() => {
//     // démarre ou arrête selon isRecording
//   }}
//   isRecording={isRecording}
// />
// (taper une première fois pour démarrer, une deuxième fois pour
// arrêter et envoyer)
// ─────────────────────────────────────────


export function MicButton({ onToggleVoice, isRecording }) {
  const micScale = useSharedValue(1);
  const micBg = useSharedValue(0);

  // Animation pulsante
  useEffect(() => {
    if (isRecording) {
      micBg.value = withTiming(1, { duration: 200 });
      micScale.value = withRepeat(
        withSequence(
          withTiming(1.15, { duration: 500 }),
          withTiming(1, { duration: 500 }),
        ),
        -1,
        true,
      );
    } else {
      micBg.value = withTiming(0, { duration: 200 });
      micScale.value = withTiming(1, { duration: 150 });
    }
  }, [isRecording, micBg, micScale]);

  // simple toggle sur la pression
  const handlePress = () => {
    if (onToggleVoice) {
      onToggleVoice();
    }
  };

  const animStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      micBg.value,
      [0, 1],
      ["transparent", "rgba(239,68,68,0.12)"],
    );

    return {
      transform: [{ scale: micScale.value }],
      backgroundColor,
    };
  });

  return (
    <TouchableOpacity onPress={handlePress} style={styles.wrapper}>
      <Animated.View style={animStyle}>
        <Mic size={22} color={isRecording ? "#EF4444" : "#64748B"} />
      </Animated.View>
    </TouchableOpacity>
  );
}
const styles = StyleSheet.create({
  wrapper: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
});

// ─────────────────────────────────────────────────────
// 📊 Progress Circle — affiche le pourcentage de la durée  du
// ─────────────────────────────────────────────────────

const SIZE = 60;
const STROKE_WIDTH = 6;
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function VoiceProgressCircle({ progress, duration }) {
  const strokeDashoffset = CIRCUMFERENCE - CIRCUMFERENCE * progress;

  return (
    <View style={{ alignItems: "center", justifyContent: "center" }}>
      <Svg width={SIZE} height={SIZE}>
        <Circle
          stroke="#ddd"
          fill="none"
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          strokeWidth={STROKE_WIDTH}
        />
        <Circle
          stroke="#25D366"
          fill="none"
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          strokeWidth={STROKE_WIDTH}
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${SIZE / 2}, ${SIZE / 2}`}
        />
      </Svg>

      <Text style={{ position: "absolute", fontSize: 12 }}>{duration}</Text>
    </View>
  );
}
