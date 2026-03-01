import { Mic } from "lucide-react-native";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from "react-native-reanimated";

// ─────────────────────────────────────────
// 🧩 MIC BUTTON
// Usage:
// <MicButton
//   onStartVoice={onStartVoice}
//   onStopVoice={onStopVoice}
//   isRecording={isRecording}
// />
// ─────────────────────────────────────────
export function MicButton({
  onStartVoice,
  onStopVoice,
  isRecording,
  sendingVoice = false,
}) {
  const micScale = useSharedValue(1);
  const micBg = useSharedValue(0);

  // ── Pulse animation pendant l'enregistrement
  useEffect(() => {
    if (isRecording) {
      micBg.value = withTiming(1, { duration: 200 });
      micScale.value = withRepeat(
        withSequence(
          withTiming(1.15, { duration: 500 }),
          withTiming(1.0, { duration: 500 }),
        ),
        -1,
        true,
      );
    } else {
      micBg.value = withTiming(0, { duration: 200 });
      micScale.value = withTiming(1, { duration: 150 });
    }
  }, [isRecording]);

  // ── Gesture : press & hold
  const gesture = Gesture.LongPress()
    .minDuration(150)
    .onStart(() => {
      runOnJS(onStartVoice)();
    })
    .onFinalize(() => {
      runOnJS(onStopVoice)();
    });

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: micScale.value }],
    backgroundColor: micBg.value === 1 ? "rgba(239,68,68,0.12)" : "transparent",
    borderRadius: 20,
    padding: 4,
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.wrapper, animStyle]}>
        {sendingVoice && (
          <ActivityIndicator
            size="small"
            color="#3B82F6"
            style={{ marginRight: 4 }}
          />
        )}
        <Mic size={22} color={isRecording ? "#EF4444" : "#64748B"} />
      </Animated.View>
    </GestureDetector>
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
