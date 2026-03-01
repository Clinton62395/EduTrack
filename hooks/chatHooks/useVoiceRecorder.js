import { Audio } from "expo-av";
import { useEffect, useRef, useState } from "react";

export const useVoiceRecorder = () => {
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const timerRef = useRef(null);

  // Nettoyer le timer au démontage
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  async function startRecording() {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== "granted") return;

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
      );

      setRecording(recording);
      setIsRecording(true);
      setDuration(0);

      // Compteur de secondes pour l'affichage
      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Échec du démarrage de l'enregistrement", err);
    }
  }

  async function stopRecording() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (!recording) {
      setIsRecording(false);
      setDuration(0);
      return null;
    }

    try {
      await recording.stopAndUnloadAsync();
      // Libère le hardware AVANT de changer l'état UI
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });
      const uri = recording.getURI();
      setRecording(null);
      setIsRecording(false); // ← après le hardware
      setDuration(0);
      return uri;
    } catch (err) {
      console.error("Erreur arrêt enregistrement:", err);
      setIsRecording(false); // ← toujours reset en cas d'erreur
      setRecording(null);
      return null;
    }
  }
  // "1:05" — pour l'affichage dans ChatInput
  const formattedDuration = `${Math.floor(duration / 60)}:${String(duration % 60).padStart(2, "0")}`;

  return { startRecording, stopRecording, isRecording, formattedDuration };
};
