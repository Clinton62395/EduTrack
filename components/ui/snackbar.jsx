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
export function Snack({ visible, onDismiss, duration = 4000, message, type }) {
  const { colors } = theme;
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
        visible={true}
        onDismiss={onDismiss}
        duration={duration}
        style={{
          backgroundColor: type === "error" ? colors.danger : colors.primary,
          borderRadius: 10,
        }}
      >
        <Text style={{ color: "white" }}>{message}</Text>
      </Snackbar>
    </Animated.View>
  );
}
