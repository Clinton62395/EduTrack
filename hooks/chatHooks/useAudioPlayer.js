import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system/legacy";
import { useEffect, useRef, useState } from "react";

let activeSoundInstance = null;
let activeSetIsPlaying = null;

const AUDIO_CACHE_DIR = FileSystem.cacheDirectory + "audio/";

async function getCachedAudio(uri) {
  try {
    await FileSystem.makeDirectoryAsync(AUDIO_CACHE_DIR, {
      intermediates: true,
    });
    const filename = uri.split("/").pop().split("?")[0];
    const localPath = AUDIO_CACHE_DIR + filename;
    const info = await FileSystem.getInfoAsync(localPath);

    if (info.exists) {
      return localPath;
    }
    await FileSystem.downloadAsync(uri, localPath);
    return localPath;
  } catch (err) {
    console.warn("Cache audio echoue, fallback URI:", err);
    return uri;
  }
}

export const stopGlobalAudio = async () => {
  if (activeSoundInstance) {
    try {
      await activeSoundInstance.pauseAsync();
      if (activeSetIsPlaying) activeSetIsPlaying(false);
      activeSoundInstance = null;
      activeSetIsPlaying = null;
    } catch (e) {
      console.log("Erreur stopGlobalAudio", e);
    }
  }
};

export const useAudioPlayer = (uri) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0); // ✅ useState au lieu de useSharedValue
  const soundRef = useRef(null);

  const onPlaybackStatusUpdate = (status) => {
    if (!status.isLoaded) return;
    setPosition(status.positionMillis);
    setDuration(status.durationMillis || 0);
    setIsPlaying(status.isPlaying);

    const pct =
      status.durationMillis > 0
        ? (status.positionMillis / status.durationMillis) * 100
        : 0;
    setProgress(pct); // ✅ setState simple, pas de shared value

    if (status.didJustFinish) {
      setIsPlaying(false);
      setProgress(0);
      soundRef.current?.unloadAsync();
      soundRef.current = null;
      activeSoundInstance = null;
      activeSetIsPlaying = null;
    }
  };

  const handlePlayPause = async () => {
    try {
      if (!soundRef.current) {
        await stopGlobalAudio();
        setIsLoading(true);
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          shouldDuckAndroid: true,
        });
        const cachedUri = await getCachedAudio(uri);
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: cachedUri },
          {
            shouldPlay: true,
            isLooping: false,
            progressUpdateIntervalMillis: 100,
          },
          onPlaybackStatusUpdate,
        );
        soundRef.current = newSound;
        activeSoundInstance = newSound;
        activeSetIsPlaying = setIsPlaying;
      } else {
        if (isPlaying) {
          await soundRef.current.pauseAsync();
        } else {
          await stopGlobalAudio();
          await soundRef.current.playAsync();
          activeSoundInstance = soundRef.current;
          activeSetIsPlaying = setIsPlaying;
        }
      }
    } catch (err) {
      console.error("Erreur Audio Hook:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const seekTo = async (percentage) => {
    if (!soundRef.current || duration === 0) return;
    const targetMs = (percentage / 100) * duration;
    try {
      await soundRef.current.setPositionAsync(targetMs);
      setProgress(percentage); // ✅ setState simple
    } catch (err) {
      console.error("Erreur seekTo:", err);
    }
  };

  useEffect(() => {
    return () => {
      if (soundRef.current) {
        if (activeSoundInstance === soundRef.current) {
          activeSoundInstance = null;
          activeSetIsPlaying = null;
        }
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  return {
    isPlaying,
    isLoading,
    position,
    duration,
    progress, // ✅ number (0-100) au lieu de SharedValue
    handlePlayPause,
    seekTo,
    stopGlobalAudio,
  };
};
