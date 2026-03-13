import { db } from "@/components/lib/firebase";
import { Box, Text } from "@/components/ui/theme";
import {
  doc,
  serverTimestamp,
  updateDoc,
} from "@react-native-firebase/firestore";
import { Clock, StopCircle } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, TouchableOpacity } from "react-native";
import { useAttendance } from "../learnerProfile/hooks/useAttendance";

export function TrainerAttendanceControl({ trainingId, trainingTitle }) {
  const { createAttendanceSession, loading } = useAttendance();

  const [activeCode, setActiveCode] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [expiresAt, setExpiresAt] = useState(null); // Date JS
  const [timeLeft, setTimeLeft] = useState(null); // secondes restantes
  const [closing, setClosing] = useState(false);

  const intervalRef = useRef(null);

  // ─────────────────────────────────────────
  // ⏱ Countdown
  // ─────────────────────────────────────────
  useEffect(() => {
    if (!expiresAt) return;

    const tick = () => {
      const remaining = Math.max(
        0,
        Math.floor((expiresAt.getTime() - Date.now()) / 1000),
      );
      setTimeLeft(remaining);

      // Session expirée côté client — on nettoie sans appel Firestore
      // (Firestore gère déjà l'expiration via expiresAt dans validateAttendance)
      if (remaining === 0) {
        clearInterval(intervalRef.current);
        setActiveCode(null);
        setSessionId(null);
        setExpiresAt(null);
        setTimeLeft(null);
      }
    };

    tick(); // Premier tick immédiat
    intervalRef.current = setInterval(tick, 1000);

    return () => clearInterval(intervalRef.current);
  }, [expiresAt]);

  // ─────────────────────────────────────────
  // 🚀 Générer le code
  // ─────────────────────────────────────────
  const handleStart = async () => {
    const result = await createAttendanceSession(trainingId, trainingTitle);
    if (result?.code) {
      setActiveCode(result.code);
      setSessionId(result.sessionId);
      // expiresAt = maintenant + 15 min (identique à ce que Firestore stocke)
      setExpiresAt(new Date(Date.now() + 15 * 60 * 1000));
    }
  };

  // ─────────────────────────────────────────
  // 🛑 Terminer la session
  // ─────────────────────────────────────────
  const handleClose = async () => {
    if (!sessionId) return;
    try {
      setClosing(true);
      await updateDoc(doc(db, "attendance_sessions", sessionId), {
        active: false,
        closedAt: serverTimestamp(),
      });
    } catch (e) {
      console.error("Erreur fermeture session:", e);
    } finally {
      clearInterval(intervalRef.current);
      setActiveCode(null);
      setSessionId(null);
      setExpiresAt(null);
      setTimeLeft(null);
      setClosing(false);
    }
  };

  // ─────────────────────────────────────────
  // 🕐 Formater mm:ss
  // ─────────────────────────────────────────
  const formatTime = (seconds) => {
    if (seconds === null) return "--:--";
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const isUrgent = timeLeft !== null && timeLeft <= 60;

  return (
    <Box
      backgroundColor="white"
      padding="l"
      borderRadius="xl"
      borderWidth={1}
      borderColor="border"
      style={{
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
      }}
    >
      <Text variant="title" marginBottom="s">
        Appel du jour
      </Text>

      {!activeCode ? (
        // ── État initial ──
        <Box>
          <Text variant="body" color="muted" marginBottom="l">
            Générez un code temporaire pour valider la présence de vos élèves.
            Le code expire après 15 minutes.
          </Text>
          <TouchableOpacity onPress={handleStart} disabled={loading}>
            <Box
              backgroundColor="primary"
              padding="m"
              borderRadius="m"
              alignItems="center"
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text color="white" fontWeight="bold">
                  Générer le code
                </Text>
              )}
            </Box>
          </TouchableOpacity>
        </Box>
      ) : (
        // ── Session active ──
        <Box alignItems="center">
          <Text variant="caption" color="muted" marginBottom="s">
            Code de présence actif
          </Text>

          {/* Code */}
          <Text
            style={{
              fontSize: 52,
              fontWeight: "bold",
              color: isUrgent ? "danger" : "primary",
              letterSpacing: 12,
            }}
          >
            {activeCode}
          </Text>

          {/* Countdown */}
          <Box
            flexDirection="row"
            alignItems="center"
            gap="xs"
            marginTop="m"
            paddingHorizontal="m"
            paddingVertical="s"
            borderRadius="m"
            backgroundColor={isUrgent ? "#FEF2F2" : "secondaryBackground"}
          >
            <Clock size={16} color={isUrgent ? "danger" : "muted"} />
            <Text
              variant="caption"
              fontWeight="700"
              style={{ color: isUrgent ? "danger" : "muted" }}
            >
              Expire dans {formatTime(timeLeft)}
            </Text>
          </Box>

          {/* Terminer */}
          <TouchableOpacity
            onPress={handleClose}
            disabled={closing}
            style={{ marginTop: 20 }}
          >
            <Box
              flexDirection="row"
              alignItems="center"
              gap="s"
              paddingHorizontal="l"
              paddingVertical="s"
              borderRadius="m"
              borderWidth={1}
              borderColor="danger"
            >
              {closing ? (
                <ActivityIndicator size="small" color="#EF4444" />
              ) : (
                <StopCircle size={16} color="#EF4444" />
              )}
              <Text style={{ color: "#EF4444" }} fontWeight="600">
                Terminer la session
              </Text>
            </Box>
          </TouchableOpacity>
        </Box>
      )}
    </Box>
  );
}
