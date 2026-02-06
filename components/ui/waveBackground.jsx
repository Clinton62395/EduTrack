import { useEffect } from "react";
import { Dimensions, StyleSheet } from "react-native";
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import Svg, { Defs, LinearGradient, Path, Stop } from "react-native-svg";
import { Box } from "./theme";

const { width, height } = Dimensions.get("window");
const AnimatedPath = Animated.createAnimatedComponent(Path);

export default function WaveBackground({
  primaryColor = "#2563EB",
  secondaryColor = "#1D4ED8",
  variant = "login",
}) {
  // Animation values
  const wave1Progress = useSharedValue(0);
  const wave2Progress = useSharedValue(0);
  const wave3Progress = useSharedValue(0);

  useEffect(() => {
    wave1Progress.value = withRepeat(
      withTiming(1, {
        duration: 8000,
        easing: Easing.inOut(Easing.sine),
      }),
      -1,
      true,
    );

    wave2Progress.value = withRepeat(
      withTiming(1, {
        duration: 6000,
        easing: Easing.inOut(Easing.sine),
      }),
      -1,
      true,
    );

    wave3Progress.value = withRepeat(
      withTiming(1, {
        duration: 10000,
        easing: Easing.inOut(Easing.sine),
      }),
      -1,
      true,
    );
  }, []);

  // ===== WAVE 1 =====
  const animatedProps1 = useAnimatedProps(() => {
    "worklet";
    const progress = wave1Progress.value;
    const amplitude = 20;
    const frequency = 2;

    const offsetY = Math.sin(progress * Math.PI * 2) * amplitude;
    const phase = progress * frequency * Math.PI * 2;

    return {
      d: `
        M 0 ${height * 0.7 + offsetY}
        Q ${width * 0.25} ${height * 0.7 + offsetY + Math.sin(phase) * 30}
          ${width * 0.5} ${height * 0.7 + offsetY}
        T ${width} ${height * 0.7 + offsetY}
        L ${width} ${height}
        L 0 ${height}
        Z
      `,
    };
  });

  // ===== WAVE 2 =====
  const animatedProps2 = useAnimatedProps(() => {
    const progress = wave2Progress.value;
    const amplitude = 25;
    const frequency = 1.5;

    const offsetY = Math.sin(progress * Math.PI * 2 + Math.PI / 2) * amplitude;
    const phase = progress * frequency * Math.PI * 2 + Math.PI / 4;

    return {
      d: `
        M 0 ${height * 0.75 + offsetY}
        Q ${width * 0.25} ${height * 0.75 + offsetY + Math.sin(phase) * 35}
          ${width * 0.5} ${height * 0.75 + offsetY}
        T ${width} ${height * 0.75 + offsetY}
        L ${width} ${height}
        L 0 ${height}
        Z
      `,
    };
  });

  // ===== WAVE 3 =====
  const animatedProps3 = useAnimatedProps(() => {
    const progress = wave3Progress.value;
    const amplitude = 15;
    const frequency = 2.5;

    const offsetY = Math.sin(progress * Math.PI * 2 + Math.PI) * amplitude;
    const phase = progress * frequency * Math.PI * 2 + Math.PI / 2;

    return {
      d: `
        M 0 ${height * 0.8 + offsetY}
        Q ${width * 0.25} ${height * 0.8 + offsetY + Math.sin(phase) * 25}
          ${width * 0.5} ${height * 0.8 + offsetY}
        T ${width} ${height * 0.8 + offsetY}
        L ${width} ${height}
        L 0 ${height}
        Z
      `,
    };
  });

  return (
    <Box style={StyleSheet.absoluteFillObject}>
      <Svg width={width} height={height} style={StyleSheet.absoluteFillObject}>
        <Defs>
          <LinearGradient id="wave1Gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor={primaryColor} stopOpacity="0.3" />
            <Stop offset="100%" stopColor={primaryColor} stopOpacity="0.1" />
          </LinearGradient>

          <LinearGradient id="wave2Gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor={primaryColor} stopOpacity="0.2" />
            <Stop offset="100%" stopColor={secondaryColor} stopOpacity="0.15" />
          </LinearGradient>

          <LinearGradient id="wave3Gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor={secondaryColor} stopOpacity="0.25" />
            <Stop offset="100%" stopColor={secondaryColor} stopOpacity="0.2" />
          </LinearGradient>
        </Defs>

        {/* Back → Front */}
        <AnimatedPath
          animatedProps={animatedProps3}
          fill="url(#wave3Gradient)"
        />
        <AnimatedPath
          animatedProps={animatedProps2}
          fill="url(#wave2Gradient)"
        />
        <AnimatedPath
          animatedProps={animatedProps1}
          fill="url(#wave1Gradient)"
        />
      </Svg>
    </Box>
  );
}
