import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system/legacy";
import { useEffect, useRef, useState } from "react";
import { useSharedValue, withTiming } from "react-native-reanimated";

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

    console.log("URI:", uri);
    console.log("Filename extrait:", filename);
    console.log("Existe en cache:", info.exists);

    if (info.exists) {
      console.log("Audio depuis cache:", filename);
      return localPath;
    }
    console.log("Telechargement audio:", filename);
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
  const soundRef = useRef(null);
  const progressAnim = useSharedValue(0);

  const onPlaybackStatusUpdate = (status) => {
    if (!status.isLoaded) return;
    setPosition(status.positionMillis);
    setDuration(status.durationMillis || 0);
    setIsPlaying(status.isPlaying);
    const pct =
      status.durationMillis > 0
        ? (status.positionMillis / status.durationMillis) * 100
        : 0;
    progressAnim.value = withTiming(pct, { duration: 80 });
    if (status.didJustFinish) {
      setIsPlaying(false);
      progressAnim.value = withTiming(0, { duration: 300 });
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
        // ✅ Cache local — plus de re-download
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
      progressAnim.value = percentage;
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
    progressAnim,
    handlePlayPause,
    seekTo,
    stopGlobalAudio,
  };
};
