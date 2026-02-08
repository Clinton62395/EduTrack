import { useEffect } from "react";
import { StyleSheet, useWindowDimensions } from "react-native";
import Animated, {
  Easing,
  interpolateColor,
  useAnimatedProps,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import Svg, { Defs, LinearGradient, Path, Stop } from "react-native-svg";
import { Box } from "./theme";

const AnimatedPath = Animated.createAnimatedComponent(Path);

export default function WaveBackground({
  primaryColor = "#2563EB",
  secondaryColor = "#1D4ED8",
  tertiaryColor = "#3B82F6", // nouvelle couleur
}) {
  const { width, height } = useWindowDimensions();

  // Trois progress values pour trois vagues
  const progress1 = useSharedValue(0);
  const progress2 = useSharedValue(0);
  const progress3 = useSharedValue(0);

  useEffect(() => {
    progress1.value = withRepeat(
      withTiming(1, { duration: 20000, easing: Easing.linear }),
      -1,
      false,
    );
    progress2.value = withRepeat(
      withTiming(1, { duration: 15000, easing: Easing.linear }),
      -1,
      false,
    );
    progress3.value = withRepeat(
      withTiming(1, { duration: 25000, easing: Easing.linear }),
      -1,
      false,
    );
  }, []);

  // Fonction utilitaire pour générer une vague sinusoïdale
  const makeWave = (progress, baseY, waveHeight, speedFactor) => {
    "worklet";
    const p = progress.value;

    const startY = baseY + Math.sin(p * Math.PI * 2 * speedFactor) * waveHeight;
    const cp1y =
      baseY +
      Math.sin((p + 0.25) * Math.PI * 2 * speedFactor) * waveHeight * 0.8;
    const cp2y =
      baseY +
      Math.sin((p + 0.5) * Math.PI * 2 * speedFactor) * waveHeight * 1.2;
    const endY =
      baseY +
      Math.sin((p + 0.75) * Math.PI * 2 * speedFactor) * waveHeight * 0.6;

    return `
      M 0 ${startY}
      C ${width * 0.25} ${cp1y}
        ${width * 0.75} ${cp2y}
        ${width} ${endY}
      L ${width} ${height}
      L 0 ${height}
      Z
    `;
  };

  // Props animés pour chaque vague
  const animatedProps1 = useAnimatedProps(() => ({
    d: makeWave(progress1, height * 0.6, 40, 1),
  }));
  const animatedProps2 = useAnimatedProps(() => ({
    d: makeWave(progress2, height * 0.65, 25, 1.2),
  }));
  const animatedProps3 = useAnimatedProps(() => ({
    d: makeWave(progress3, height * 0.7, 15, 0.8),
  }));

  // Couleur animée pour la première vague
  const animatedColor = interpolateColor(
    progress1.value,
    [0, 1],
    [primaryColor, secondaryColor],
  );

  return (
    <Box style={[StyleSheet.absoluteFillObject, { zIndex: -1 }]}>
      <Svg
        width={width}
        height={height}
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
      >
        <Defs>
          <LinearGradient id="wave1Gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor={animatedColor} stopOpacity="0.25" />
            <Stop offset="100%" stopColor={animatedColor} stopOpacity="0.05" />
          </LinearGradient>

          <LinearGradient id="wave2Gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor={secondaryColor} stopOpacity="0.15" />
            <Stop offset="100%" stopColor={secondaryColor} stopOpacity="0.03" />
          </LinearGradient>

          <LinearGradient id="wave3Gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor={tertiaryColor} stopOpacity="0.1" />
            <Stop offset="100%" stopColor={tertiaryColor} stopOpacity="0.02" />
          </LinearGradient>
        </Defs>

        {/* Fond gradient léger */}
        <Path
          d={`M 0 0 L ${width} 0 L ${width} ${height} L 0 ${height} Z`}
          fill={primaryColor}
          opacity={0.05}
        />

        {/* Wave 3 (arrière-plan) */}
        <AnimatedPath
          animatedProps={animatedProps3}
          fill="url(#wave3Gradient)"
        />

        {/* Wave 2 (milieu) */}
        <AnimatedPath
          animatedProps={animatedProps2}
          fill="url(#wave2Gradient)"
        />

        {/* Wave 1 (premier plan) */}
        <AnimatedPath
          animatedProps={animatedProps1}
          fill="url(#wave1Gradient)"
        />
      </Svg>
    </Box>
  );
}
