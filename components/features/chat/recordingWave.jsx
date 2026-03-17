import { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { hs } from "../../ui/theme";

const BAR_COUNT = 28;

const BASE_HEIGHTS = Array.from(
  { length: BAR_COUNT },
  (_, i) => 5 + Math.sin(i * 0.5) * 7 + (((i * 3571) % 100) / 100) * 6,
);

function RecordingBar({ index, metering }) {
  const anim = useRef(new Animated.Value(0)).current;
  const loopRef = useRef(null);

  useEffect(() => {
    const delay = (index * 35) % 350;
    const duration = 280 + ((index * 137) % 250);

    loopRef.current = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, { toValue: 1, duration, useNativeDriver: false }),
        Animated.timing(anim, { toValue: 0, duration, useNativeDriver: false }),
      ]),
    );
    loopRef.current.start();

    return () => loopRef.current?.stop();
  }, []);

  const base = BASE_HEIGHTS[index];
  // plus metering est élevé, plus les barres montent
  const maxExtra = base * 2.8 * Math.max(0.2, metering);

  const height = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [base, base + maxExtra],
  });

  const opacity = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.45, 1],
  });

  return (
    <Animated.View
      style={[
        styles.bar,
        {
          height,
          opacity,
          backgroundColor: `rgba(14, 165, 233, ${0.5 + metering * 0.5})`,
        },
      ]}
    />
  );
}

export function RecordingWave({ metering = 0.3, isRecording }) {
  if (!isRecording) return null;

  return (
    <View style={styles.container}>
      {BASE_HEIGHTS.map((_, index) => (
        <RecordingBar key={index} index={index} metering={metering} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    height:hs(36),
    gap: 2,
    paddingHorizontal: 2,
    overflow: "hidden",
  },
  bar: {
    flex: 1,
    borderRadius: 2,
    backgroundColor: "rgba(14, 165, 233, 0.7)",
  },
});
