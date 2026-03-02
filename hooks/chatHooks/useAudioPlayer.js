import { Audio } from "expo-av";
import { useEffect, useRef, useState } from "react";
import { useSharedValue, withTiming } from "react-native-reanimated";

// Variable en dehors du hook pour être partagée entre TOUTES les instances
let activeSoundInstance = null;
let activeSetIsPlaying = null;

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

  // Fonction pour arrêter le son globalement

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
      soundRef.current?.setPositionAsync(0);
    }
  };

  const handlePlayPause = async () => {
    try {
      if (!soundRef.current) {
        // Avant de charger le nouveau, on coupe l'ancien
        await stopGlobalAudio();

        setIsLoading(true);
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true, // On laisse le micro disponible
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          shouldDuckAndroid: true,
        });

        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri },
          { shouldPlay: true },
          onPlaybackStatusUpdate,
        );

        soundRef.current = newSound;
        activeSoundInstance = newSound;
        activeSetIsPlaying = setIsPlaying;
      } else {
        if (isPlaying) {
          await soundRef.current.pauseAsync();
        } else {
          // Si on relance, on coupe les autres d'abord
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

  useEffect(() => {
    return () => {
      if (soundRef.current) {
        // Si on démonte le player qui était en train de jouer
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
    stopGlobalAudio, // On l'exporte pour pouvoir l'appeler depuis le Recorder !
  };
};
