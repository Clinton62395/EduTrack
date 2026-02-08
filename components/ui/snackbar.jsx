import theme from "@/components/ui/theme";
import { useEffect, useState } from "react";
import { Text } from "react-native";
import { Snackbar } from "react-native-paper";
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
  message,
  type = "success",
}) {
  const { colors } = theme;
  const [shouldRender, setShouldRender] = useState(visible);
  // background color
  const backgroundColor =
    type === "error"
      ? colors.danger
      : type === "warning"
        ? colors.warning
        : colors.primary;

  const translateY = useSharedValue(80);
  const opacity = useSharedValue(0);

  // ✅ Déclenchement de l'animation
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

  // ✅ Style d'animation
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
        visible={true}
        onDismiss={onDismiss}
        duration={duration}
        wrapperStyle={{
          bottom: 0,
        }}
        style={{
          backgroundColor: backgroundColor,
          borderRadius: 10,
        }}
      >
        <Text style={{ color: "white" }}>{message}</Text>
      </Snackbar>
    </Animated.View>
  );
}
