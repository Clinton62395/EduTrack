import theme, { Box } from "@/components/ui/theme";
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

import { Image } from "expo-image";
export function Snack({
  visible,
  onDismiss,
  duration = 4000,
  message,
  type = "success",
}) {
  const { colors } = theme;
  const [shouldRender, setShouldRender] = useState(visible);
  // background color with semi-transparency
  const backgroundColor =
    type === "error"
      ? "rgba(220, 53, 69, 0.9)" // danger with alpha
      : type === "warning"
        ? "rgba(255, 193, 7, 0.9)" // warning with alpha
        : "rgba(40, 167, 69, 0.9)"; // success with alpha

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
        <Box flexDirection="row" alignItems="center" gap="m">
          <Image
            source={require("@/assets/images/snack-logo.png")}
            style={{
              width: 40,
              height: 40,
              tintColor: "white",
            }}
            contentFit="cover"
          />
          <Text style={{ color: "white" }}>{message}</Text>
        </Box>
      </Snackbar>
    </Animated.View>
  );
}
