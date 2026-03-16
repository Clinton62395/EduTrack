import {
  arrayUnion,
  doc,
  serverTimestamp,
  updateDoc,
} from "@react-native-firebase/firestore";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { db } from "../lib/firebase";

// ─────────────────────────────────────────
// 📱 ENREGISTREMENT TOKEN
// ─────────────────────────────────────────
export async function registerForPushNotificationsAsync(userId) {
  if (!Device.isDevice) {
    console.log("Les notifications nécessitent un appareil physique");
    return null;
  }
  try {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      console.log("Permission de notification refusée");
      return null;
    }
    const token = (
      await Notifications.getExpoPushTokenAsync({
        projectId: "03922016-5439-4bb9-9fae-f5a8018b0b25",
      })
    ).data;

    if (userId && token) {
      await updateDoc(doc(db, "users", userId), {
        pushTokens: arrayUnion(token),
        lastTokenUpdate: serverTimestamp(),
      });
    }
    return token;
  } catch (error) {
    console.error("Erreur Enregistrement Token:", error);
    return null;
  }
}

// ─────────────────────────────────────────
// 📣 BROADCAST — Appel du jour (existant)
// ─────────────────────────────────────────
export async function broadcastNotification(tokens, trainingTitle, code) {
  if (!tokens || tokens.length === 0) return;
  const uniqueTokens = [...new Set(tokens.filter((t) => t))];
  const messages = uniqueTokens.map((token) => ({
    to: token,
    sound: "default",
    title: `📍 Appel : ${trainingTitle}`,
    body: `Le code de présence est : ${code}. Valable 15 min.`,
    data: { trainingTitle, code, type: "ATTENDANCE" },
    _displayInForeground: true,
  }));
  try {
    const response = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(messages),
    });
    return await response.json();
  } catch (error) {
    console.error("Erreur Broadcast Expo:", error);
    throw error;
  }
}

// ─────────────────────────────────────────
// 🚀 NOTIFICATION PUBLICATION FORMATION
// Envoyée à tous les participants quand le trainer publie
// participants = tableau de strings (UIDs)
// ─────────────────────────────────────────
export async function sendPublicationNotification(
  participants,
  trainingTitle,
  invitationCode,
) {
  if (!participants || participants.length === 0) return;

  try {
    // Récupérer les pushTokens de chaque participant
    const { getDocs, collection, query, where } =
      await import("@react-native-firebase/firestore");
    const { db } = await import("../lib/firebase");

    // Chunking à 30 — limite Firestore "in"
    const chunks = [];
    for (let i = 0; i < participants.length; i += 30) {
      chunks.push(participants.slice(i, i + 30));
    }

    const userSnaps = await Promise.all(
      chunks.map((chunk) =>
        getDocs(query(collection(db, "users"), where("__name__", "in", chunk))),
      ),
    );

    const tokens = userSnaps
      .flatMap((snap) => snap.docs)
      .flatMap((d) => d.data().pushTokens || [])
      .filter(Boolean);

    if (tokens.length === 0) return;

    const uniqueTokens = [...new Set(tokens)];

    const messages = uniqueTokens.map((token) => ({
      to: token,
      sound: "default",
      title: `🎓 Formation disponible !`,
      body: `"${trainingTitle}" est maintenant publiée. Code : ${invitationCode}`,
      data: { type: "PUBLICATION", trainingTitle, invitationCode },
      _displayInForeground: true,
    }));

    const response = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(messages),
    });

    return await response.json();
  } catch (error) {
    console.error("Erreur sendPublicationNotification:", error);
  }
}

// ─────────────────────────────────────────
// 🔔 NOTIFICATION AU TRAINER
// Envoyée quand un élève termine une leçon ou génère un certificat
// ─────────────────────────────────────────
export async function sendTrainerNotification(trainerId, type, payload) {
  if (!trainerId) return;

  try {
    const { getDoc, doc } = await import("@react-native-firebase/firestore");
    const { db } = await import("../lib/firebase");

    const trainerSnap = await getDoc(doc(db, "users", trainerId));
    if (!trainerSnap.exists()) return;

    const tokens = trainerSnap.data()?.pushTokens || [];
    if (tokens.length === 0) return;

    const uniqueTokens = [...new Set(tokens.filter(Boolean))];

    let title = "";
    let body = "";
    let data = { type };

    if (type === "LESSON_COMPLETED") {
      title = `📖 Leçon terminée`;
      body = `${payload.learnerName} a terminé "${payload.lessonTitle}" dans ${payload.trainingTitle}`;
      data = { ...data, ...payload };
    }

    if (type === "CERTIFICATE_GENERATED") {
      title = `🏆 Certificat généré !`;
      body = `${payload.learnerName} a obtenu son certificat pour "${payload.trainingTitle}"`;
      data = { ...data, ...payload };
    }

    const messages = uniqueTokens.map((token) => ({
      to: token,
      sound: "default",
      title,
      body,
      data,
      _displayInForeground: true,
    }));

    const response = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(messages),
    });

    return await response.json();
  } catch (error) {
    console.error("Erreur sendTrainerNotification:", error);
  }
}
