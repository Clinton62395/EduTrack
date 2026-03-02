import { Audio } from "expo-av";
import * as Haptics from "expo-haptics";
import { useCallback, useEffect, useRef, useState } from "react";
import { stopGlobalAudio } from "./useAudioPlayer";

export const useVoiceRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);

  const recordingRef = useRef(null);
  const timerRef = useRef(null);
  const isStartingRef = useRef(false);
  const durationRef = useRef(0);

  // 1. Pré-préparation agressive au montage
  useEffect(() => {
    const prepare = async () => {
      try {
        const { status } = await Audio.requestPermissionsAsync();
        if (status === "granted") {
          await Audio.setAudioModeAsync({
            allowsRecordingIOS: true,
            playsInSilentModeIOS: true,
            staysActiveInBackground: false,
            shouldDuckAndroid: true,
          });
        }
      } catch (e) {
        console.error("Erreur préparation initiale", e);
      }
    };
    prepare();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startRecording = useCallback(async (onProgress) => {
    if (isStartingRef.current || recordingRef.current) return;
    isStartingRef.current = true;

    try {
      // s'assurer d'avoir les droits au moment où l'utilisateur appuie
      const permissions = await Audio.getPermissionsAsync();
      if (permissions.status !== "granted") {
        const { status } = await Audio.requestPermissionsAsync();
        if (status !== "granted") {
          console.warn("Microphone permission denied");
          return;
        }
      }

      // 🛑 Arrêter les sons avant de toucher au micro
      await stopGlobalAudio();

      // IMPORTANT: on remet un mode complet qui autorise l'enregistrement.
      // On reprend les mêmes champs qu'au montage pour éviter de perdre
      // des options (android duck, background, etc.).
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });

      // 🎙️ Création de l'objet d'enregistrement
      const newRecording = new Audio.Recording();

      // On prépare l'enregistrement
      await newRecording.prepareToRecordAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
      );

      // SEULEMENT MAINTENANT on commence vraiment et on vibre
      await newRecording.startAsync();

      recordingRef.current = newRecording;
      durationRef.current = 0;
      setDuration(0);
      setIsRecording(true);

      // Vibration pour confirmer que CA ENREGISTRE vraiment
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      timerRef.current = setInterval(() => {
        durationRef.current += 1;
        setDuration(durationRef.current);
        if (typeof onProgress === "function") {
          // onProgress attend un pourcentage
          onProgress(durationRef.current / 120);
        }
      }, 1000);
    } catch (err) {
      console.error("CRASH START RECORDING:", err);
      recordingRef.current = null;
      setIsRecording(false);
    } finally {
      isStartingRef.current = false;
    }
  }, []);

  const stopRecording = useCallback(async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const currentRecording = recordingRef.current;

    if (!currentRecording) {
      setIsRecording(false);
      return null;
    }

    try {
      setIsRecording(false);

      // On vérifie si l'enregistrement est bien en cours avant de stopper
      const status = await currentRecording.getStatusAsync();
      if (status.isRecording || status.canRecord) {
        await currentRecording.stopAndUnloadAsync();
      }

      const uri = currentRecording.getURI();
      recordingRef.current = null;
      durationRef.current = 0;
      setDuration(0);

      // remettre le mode audio par défaut (lecture) pour ne pas bloquer
      // les futurs enregistrements / lectures
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          shouldDuckAndroid: true,
        });
      } catch (_) {
        // on ignore les erreurs de reset, ce n'est pas critique
      }

      // on accepte tous les enregistrements, même très courts, pour
      // éviter l'impression que le micro ne répond pas suite à un simple
      // clic. Si l'appelant veut ignorer les clips trop courts, il pourra
      // le faire lui‑même.
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      return { uri, cancelled: false };
    } catch (err) {
      console.error("Erreur arrêt:", err);
      recordingRef.current = null;
      setIsRecording(false);
      return { cancelled: true };
    }
  }, []);

  const formattedDuration = `${Math.floor(duration / 60)}:${String(duration % 60).padStart(2, "0")}`;

  return {
    startRecording,
    stopRecording,
    isRecording,
    formattedDuration,
    progress: duration / 120,
  };
};
