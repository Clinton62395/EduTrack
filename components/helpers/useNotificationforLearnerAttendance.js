import firestore from "@react-native-firebase/firestore";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { db } from "../lib/firebase";

/**
 * 📱 Enregistre l'appareil pour les notifications
 * Stocke le token de manière atomique dans Firestore
 */
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

    // Récupération du token Expo
    const token = (
      await Notifications.getExpoPushTokenAsync({
        projectId: "03922016-5439-4bb9-9fae-f5a8018b0b25",
      })
    ).data;

    // 🔐 Mise à jour de l'utilisateur avec le SDK Natif
    if (userId && token) {
      await db
        .collection("users")
        .doc(userId)
        .update({
          // On utilise arrayUnion pour ne pas écraser les tokens des autres appareils de l'utilisateur
          pushTokens: firestore.FieldValue.arrayUnion(token),
          lastTokenUpdate: firestore.FieldValue.serverTimestamp(),
        });
    }

    return token;
  } catch (error) {
    console.error("Erreur Enregistrement Token:", error);
    return null;
  }
}

/**
 * 📣 Envoi groupé (Broadcast) via l'API Expo
 * Optimisé pour envoyer par paquets (chunks) de 100 max (limite Expo)
 */
export async function broadcastNotification(tokens, trainingTitle, code) {
  if (!tokens || tokens.length === 0) return;

  // Filtrer les tokens invalides ou doublons
  const uniqueTokens = [...new Set(tokens.filter((t) => t))];

  const messages = uniqueTokens.map((token) => ({
    to: token,
    sound: "default",
    title: `📍 Appel : ${trainingTitle}`,
    body: `Le code de présence est : ${code}. Valable 15 min.`,
    data: { trainingTitle, code, type: "ATTENDANCE" },
    _displayInForeground: true, // Pour forcer l'affichage si l'app est ouverte
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

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Erreur Broadcast Expo:", error);
    throw error;
  }
}
