import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef } from "react";
import { Dimensions, PanResponder, StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  Extrapolate,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

const BAR_COUNT = 40;
const { width } = Dimensions.get("window");

const BAR_HEIGHTS = Array.from(
  { length: BAR_COUNT },
  (_, i) => 4 + Math.sin(i * 0.3) * 12 + (((i * 7919) % 100) / 100) * 4,
);

function WaveBar({ index, progress, isOwn, isPlaying, activeBars, amplitude }) {
  const baseHeight = BAR_HEIGHTS[index];
  const barStyle = useAnimatedStyle(() => {
    const barProgress = (index / BAR_COUNT) * 100;
    const isActive = progress.value > barProgress;
    const animatedHeight = interpolate(
      activeBars.value,
      [0, 1],
      [baseHeight, baseHeight * 2.5],
      Extrapolate.CLAMP,
    );
    const opacity = isActive ? 1 : 0.3;
    const wavePhase = (index * 0.2) % (2 * Math.PI);
    const waveEffect = Math.sin(wavePhase) * 0.5 + 0.5;
    const finalHeight = isPlaying
      ? baseHeight + animatedHeight * waveEffect * amplitude
      : baseHeight;
    return {
      height: finalHeight,
      backgroundColor: isOwn
        ? `rgba(255, 255, 255, ${opacity})`
        : `rgba(14, 165, 233, ${opacity})`,
      transform: [{ scaleY: isActive ? 1 : 0.8 }],
    };
  });
  return <Animated.View style={[styles.waveBar, barStyle]} />;
}

export function Waveform({
  progress,
  isOwn,
  isPlaying,
  amplitude = 1,
  onSeek,
}) {
  const activeBars = useSharedValue(0);
  const containerWidth = useRef(0);
  const onSeekRef = useRef(onSeek);
  useEffect(() => {
    onSeekRef.current = onSeek;
  }, [onSeek]);

  useEffect(() => {
    if (isPlaying) {
      activeBars.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 800, easing: Easing.inOut(Easing.sin) }),
          withTiming(0.3, { duration: 800, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        true,
      );
    } else {
      activeBars.value = withTiming(0, { duration: 300 });
    }
  }, [isPlaying]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponderCapture: () => true,
      onPanResponderGrant: (e) => {
        if (!onSeekRef.current || containerWidth.current === 0) return;
        const pct = Math.min(
          100,
          Math.max(0, (e.nativeEvent.locationX / containerWidth.current) * 100),
        );
        onSeekRef.current(pct);
      },
      onPanResponderMove: (e) => {
        if (!onSeekRef.current || containerWidth.current === 0) return;
        const pct = Math.min(
          100,
          Math.max(0, (e.nativeEvent.locationX / containerWidth.current) * 100),
        );
        onSeekRef.current(pct);
      },
    }),
  ).current;

  return (
    <View
      style={styles.waveContainer}
      onLayout={(e) => {
        containerWidth.current = e.nativeEvent.layout.width;
      }}
      {...panResponder.panHandlers}
    >
      <LinearGradient
        colors={
          isOwn
            ? ["rgba(255,255,255,0.2)", "rgba(255,255,255,0.8)"]
            : ["rgba(14,165,233,0.2)", "rgba(14,165,233,0.8)"]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradientTrack}
      />
      <View style={styles.barsContainer}>
        {BAR_HEIGHTS.map((_, index) => (
          <WaveBar
            key={index}
            index={index}
            progress={progress}
            isOwn={isOwn}
            isPlaying={isPlaying}
            activeBars={activeBars}
            amplitude={amplitude}
          />
        ))}
      </View>
      <Animated.View
        style={[
          styles.seekCursor,
          useAnimatedStyle(() => ({
            left: `${progress.value}%`,
            opacity: progress.value > 0 ? 1 : 0,
          })),
        ]}
      />
      <Animated.View
        style={[
          styles.glowOverlay,
          useAnimatedStyle(() => ({
            opacity: isPlaying ? 0.5 : 0,
            transform: [
              {
                translateX: interpolate(
                  progress.value,
                  [0, 100],
                  [-width, width],
                ),
              },
            ],
          })),
        ]}
      >
        <LinearGradient
          colors={["transparent", "rgba(255,255,255,0.3)", "transparent"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  waveContainer: {
    height: 40,
    position: "relative",
    overflow: "hidden",
    borderRadius: 8,
  },
  gradientTrack: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 8,
  },
  barsContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  waveBar: {
    flex: 1,
    marginHorizontal: 1,
    borderRadius: 2,
    backgroundColor: "#FFFFFF",
  },
  seekCursor: {
    position: "absolute",
    top: 4,
    bottom: 4,
    width: 2,
    borderRadius: 1,
    backgroundColor: "rgba(255,255,255,0.95)",
    shadowColor: "#FFF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 4,
  },
  glowOverlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
});
