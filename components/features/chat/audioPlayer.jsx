import { Audio } from "expo-av";
import { Pause, Play } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";

export function AudioPlayer({ uri, isOwn }) {
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);

  const soundRef = useRef(null);
  const progressAnim = useSharedValue(0);

  // ─────────────────────────────────────────────────────
  // 📊 Callback statut — appelé par expo-av à chaque tick
  // ─────────────────────────────────────────────────────
  const onPlaybackStatusUpdate = (status) => {
    if (!status.isLoaded) return;

    setPosition(status.positionMillis);
    setDuration(status.durationMillis || 0);
    setIsPlaying(status.isPlaying);

    // Animer la barre de progression
    const pct =
      status.durationMillis > 0
        ? (status.positionMillis / status.durationMillis) * 100
        : 0;
    progressAnim.value = withTiming(pct, { duration: 80 });

    // Fin → remettre au début
    if (status.didJustFinish) {
      setIsPlaying(false);
      progressAnim.value = withTiming(0, { duration: 300 });
      soundRef.current?.setPositionAsync(0);
    }
  };

  // ─────────────────────────────────────────────────────
  // ▶️ Charger ET jouer immédiatement
  // Fix : shouldPlay: true + on stocke dans soundRef
  // ─────────────────────────────────────────────────────
  const loadAndPlay = async () => {
    setIsLoading(true);
    try {
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true }, // ✅ joue directement après chargement
        onPlaybackStatusUpdate,
      );

      soundRef.current = newSound;
      setSound(newSound);
    } catch (err) {
      console.error("Erreur chargement audio:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────
  // ⏯️ Play / Pause
  // ─────────────────────────────────────────────────────
  const handlePlayPause = async () => {
    // Pas encore chargé → charger et jouer
    if (!sound) {
      await loadAndPlay();
      return;
    }
    if (isPlaying) {
      await sound.pauseAsync();
    } else {
      await sound.playAsync();
    }
  };

  // ─────────────────────────────────────────────────────
  // 🧹 Nettoyage mémoire au démontage
  // ─────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      soundRef.current?.unloadAsync();
    };
  }, []);

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
      {/* ── Bouton Play/Pause ── */}
      <TouchableOpacity
        onPress={handlePlayPause}
        style={[
          styles.playButton,
          isOwn ? styles.playBtnOwn : styles.playBtnOther,
        ]}
        activeOpacity={0.8}
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

      {/* ── Barre + temps ── */}
      <View style={styles.progressSection}>
        <View style={styles.track}>
          {/* Barre animée */}
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
