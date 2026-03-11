import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";
import * as Haptics from "expo-haptics";
import { useCallback, useEffect, useRef, useState } from "react";
import { stopGlobalAudio } from "./useAudioPlayer";

const MAX_DURATION = 120;

export const useVoiceRecorder = () => {
  const recorder = useAudioRecorder({
    ...RecordingPresets.HIGH_QUALITY,
    isMeteringEnabled: true,
  });

  const recorderState = useAudioRecorderState(recorder, 200);

  const timerRef = useRef(null);
  const startTimeRef = useRef(0);
  const cancelledRef = useRef(false);
  const runningRef = useRef(false);
  const permissionGrantedRef = useRef(false);
  const preparedRef = useRef(false);

  const [duration, setDuration] = useState(0);

  // -------- TIMER --------

  const startTimer = () => {
    startTimeRef.current = Date.now();

    timerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);

      setDuration(elapsed);

      if (elapsed >= MAX_DURATION) {
        stopRecording();
      }
    }, 500);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // -------- PERMISSION --------

  const ensurePermission = async () => {
    if (permissionGrantedRef.current) return true;

    const { granted } = await requestRecordingPermissionsAsync();

    permissionGrantedRef.current = granted;

    return granted;
  };

  // -------- PREPARE RECORDER --------

  const prepareRecorder = async () => {
    if (preparedRef.current) return;

    await setAudioModeAsync({
      playsInSilentMode: true,
      allowsRecording: true,
    });

    await recorder.prepareToRecordAsync({
      ...RecordingPresets.HIGH_QUALITY,
      isMeteringEnabled: true,
    });

    preparedRef.current = true;
  };

  // prépare dès que le hook est monté
  useEffect(() => {
    const init = async () => {
      try {
        const granted = await ensurePermission();
        if (!granted) return;

        await prepareRecorder();
      } catch (e) {
        console.log("prepare error", e);
      }
    };

    init();

    return () => {
      stopTimer();
    };
  }, []);

  // -------- START --------

  const startRecording = useCallback(async () => {
    if (runningRef.current) return;

    try {
      cancelledRef.current = false;

      await stopGlobalAudio();

      await recorder.record();

      runningRef.current = true;

      setDuration(0);
      startTimer();

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (err) {
      console.error("Start recording error:", err);
    }
  }, [recorder]);

  // -------- STOP --------

  const stopRecording = useCallback(async () => {
    if (!runningRef.current) return { cancelled: true };

    runningRef.current = false;

    stopTimer();

    try {
      await recorder.stop();

      const uri = recorder.uri;

      if (cancelledRef.current || !uri) {
        setDuration(0);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        return { cancelled: true };
      }

      await setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: false,
      });

      setDuration(0);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      preparedRef.current = false;
      await prepareRecorder();

      return {
        uri,
        duration,
        cancelled: false,
      };
    } catch (err) {
      console.error("Stop recording error:", err);
      return { cancelled: true };
    }
  }, [recorder, duration]);

  // -------- CANCEL --------

  const cancelRecording = useCallback(async () => {
    if (!runningRef.current) return;

    cancelledRef.current = true;

    stopTimer();

    runningRef.current = false;

    try {
      await recorder.stop();

      await setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: false,
      });

      setDuration(0);

      preparedRef.current = false;
      await prepareRecorder();

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch (err) {
      console.error("Cancel recording error:", err);
    }
  }, [recorder]);

  // -------- FORMAT --------

  const formattedDuration = `${Math.floor(duration / 60)}:${String(
    duration % 60,
  ).padStart(2, "0")}`;

  const metering =
    recorderState.metering != null
      ? Math.max(0, Math.min(1, (recorderState.metering + 60) / 60))
      : 0;

  return {
    startRecording,
    stopRecording,
    cancelRecording,
    isRecording: recorderState.isRecording ?? false,
    duration,
    formattedDuration,
    progress: duration / MAX_DURATION,
    metering,
  };
};
