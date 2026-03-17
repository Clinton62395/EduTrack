import { Pause, Play } from "lucide-react-native";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAudioPlayer } from "../../../hooks/chatHooks/useAudioPlayer";
import { hs, ms, vs } from "../../ui/theme";
import { Waveform } from "./audioWave";

export function AudioPlayer({ uri, isOwn }) {
  const {
    isPlaying,
    isLoading,
    position,
    duration,
    progress, // ✅ simple number 0-100
    seekTo,
    handlePlayPause,
  } = useAudioPlayer(uri);

  const formatTime = (millis) => {
    if (!millis) return "0:00";
    const m = Math.floor(millis / 60000);
    const s = Math.floor((millis % 60000) / 1000);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

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
        <Waveform
          progress={progress} // ✅ number au lieu de SharedValue
          onSeek={seekTo}
          isOwn={isOwn}
          isPlaying={isPlaying}
          amplitude={isPlaying ? 1 : 0.5}
        />
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
    padding: ms(10),
    borderRadius: ms(14),
    width: hs(220),
    gap: ms(10),
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
    width: hs(38),
    height: vs(38),
    borderRadius: ms(19),
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

  progressSection: { flex: 1, gap: ms(5) },

  timeText: {
    fontSize: ms(10),
    color: "rgba(255,255,255,0.45)",
    letterSpacing: ms(0.3),
  },

  timeTextOwn: { color: "rgba(255,255,255,0.65)" },
});
