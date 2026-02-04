import { useEffect, useState } from "react";
import { Snackbar, useTheme } from "react-native-paper";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

export function Snack({
  visible,
  onDismiss,
  duration = 4000,
  children,
  error,
}) {
  const { colors } = useTheme();
  const [shouldRender, setShouldRender] = useState(visible);

  const translateY = useSharedValue(80);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      setShouldRender(true);
      translateY.value = withSpring(0, { damping: 15 });
      opacity.value = withTiming(1, { duration: 200 });
    } else {
      opacity.value = withTiming(0, { duration: 200 }, () => {
        runOnJS(setShouldRender)(false);
      });
      translateY.value = withTiming(80, { duration: 200 });
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  if (!shouldRender) return null;

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          bottom: 50,
          left: 16,
          right: 16,
          zIndex: 1000,
        },
        animatedStyle,
      ]}
      pointerEvents="box-none"
    >
      <Snackbar
        visible={true} // ← Toujours true, on gère la sortie via Animated.View
        onDismiss={onDismiss}
        duration={duration}
        style={{
          backgroundColor: error ? colors.error : colors.primary, // ← dynamique
          borderRadius: 10,
        }}
      >
        {children}
      </Snackbar>
    </Animated.View>
  );
}
