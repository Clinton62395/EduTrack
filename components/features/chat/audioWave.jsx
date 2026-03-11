import { useRef } from "react";
import { PanResponder, StyleSheet, View } from "react-native";

const BAR_COUNT = 40;

const BAR_HEIGHTS = Array.from(
  { length: BAR_COUNT },
  (_, i) => 4 + Math.sin(i * 0.3) * 12 + (((i * 7919) % 100) / 100) * 4,
);

export function Waveform({
  progress,
  isOwn,
  isPlaying,
  amplitude = 1,
  onSeek,
}) {
  const containerWidth = useRef(0);
  const onSeekRef = useRef(onSeek);

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
      {/* Barres statiques — pas de Reanimated */}
      <View style={styles.barsContainer}>
        {BAR_HEIGHTS.map((height, index) => {
          const barProgress = (index / BAR_COUNT) * 100;
          const isActive = progress > barProgress;
          const finalHeight = isPlaying
            ? height * (1 + amplitude * 0.3 * Math.abs(Math.sin(index * 0.5)))
            : height;

          return (
            <View
              key={index}
              style={[
                styles.waveBar,
                {
                  height: finalHeight,
                  backgroundColor: isOwn
                    ? `rgba(255, 255, 255, ${isActive ? 1 : 0.3})`
                    : `rgba(14, 165, 233, ${isActive ? 1 : 0.3})`,
                  transform: [{ scaleY: isActive ? 1 : 0.8 }],
                },
              ]}
            />
          );
        })}
      </View>

      {/* Curseur de position */}
      {progress > 0 && (
        <View style={[styles.seekCursor, { left: `${progress}%` }]} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  waveContainer: {
    height: 40,
    position: "relative",
    overflow: "hidden",
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.05)",
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
});
