import { Pause, Play } from "lucide-react-native";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { useAudioPlayer } from "../../../hooks/chatHooks/useAudioPlayer";

export function AudioPlayer({ uri, isOwn }) {
  const {
    isPlaying,
    isLoading,
    position,
    duration,
    progressAnim,
    handlePlayPause,
  } = useAudioPlayer(uri);

  const formatTime = (millis) => {
    if (!millis) return "0:00";
    const m = Math.floor(millis / 60000);
    const s = Math.floor((millis % 60000) / 1000);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressAnim.value}%`,
  }));

  if (!uri) return null;

  return (
    <View
      style={[
        styles.container,
        isOwn ? styles.containerOwn : styles.containerOther,
      ]}
    >
      <TouchableOpacity
        onPress={handlePlayPause}
        style={[
          styles.playButton,
          isOwn ? styles.playBtnOwn : styles.playBtnOther,
        ]}
      >
        {isLoading ? (
          <ActivityIndicator color={isOwn ? "#FFF" : "#0EA5E9"} size="small" />
        ) : isPlaying ? (
          <Pause
            size={18}
            fill={isOwn ? "#FFF" : "#0EA5E9"}
            color={isOwn ? "#FFF" : "#0EA5E9"}
          />
        ) : (
          <Play
            size={18}
            fill={isOwn ? "#FFF" : "#0EA5E9"}
            color={isOwn ? "#FFF" : "#0EA5E9"}
          />
        )}
      </TouchableOpacity>

      <View style={styles.progressSection}>
        <View style={styles.track}>
          <Animated.View
            style={[
              styles.progressFill,
              isOwn ? styles.fillOwn : styles.fillOther,
              progressStyle,
            ]}
          />
        </View>
        <Text style={[styles.timeText, isOwn && styles.timeTextOwn]}>
          {formatTime(isPlaying ? position : duration)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 14,
    width: 220,
    gap: 10,
  },
  containerOther: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  containerOwn: {
    backgroundColor: "rgba(14,165,233,0.15)",
    borderWidth: 1,
    borderColor: "rgba(14,165,233,0.3)",
  },
  playButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
  },
  playBtnOwn: {
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  playBtnOther: {
    backgroundColor: "rgba(14,165,233,0.15)",
    borderWidth: 1,
    borderColor: "rgba(14,165,233,0.3)",
  },
  progressSection: { flex: 1, gap: 5 },
  track: {
    height: 3,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
  fillOther: { backgroundColor: "#0EA5E9" },
  fillOwn: { backgroundColor: "rgba(255,255,255,0.85)" },
  timeText: {
    fontSize: 10,
    color: "rgba(255,255,255,0.45)",
    letterSpacing: 0.3,
  },
  timeTextOwn: { color: "rgba(255,255,255,0.65)" },
});
