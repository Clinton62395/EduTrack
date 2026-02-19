import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { doc, updateDoc } from "firebase/firestore";
import { Platform } from "react-native";
import { db } from "../lib/firebase";

// 🔥 Fonction pour envoyer un push notification à un utilisateur
import axios from "axios";

//  🔥 Fonction pour récupérer le token de notification
export async function registerForPushNotificationsAsync(userId) {
  let token;

  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      alert("Échec de l'obtention du token pour les notifications !");
      return;
    }
    token = (await Notifications.getExpoPushTokenAsync()).data;

    // Enregistrer le token dans Firestore pour cet utilisateur
    if (userId) {
      await updateDoc(doc(db, "users", userId), {
        expoPushToken: token,
      });
    }
  } else {
    console.log("Les notifications nécessitent un appareil physique");
  }

  if (Platform.OS === "android") {
    Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
    });
  }

  return token;
}

// 🔥 Fonction pour envoyer une notification groupée avec Axios
export async function broadcastNotification(
  tokens,
  trainingTitle,
  code,
  trainingId,
) {
  const messages = tokens.map((token) => ({
    to: token,
    sound: "default",
    title: `📍 Présence : ${trainingTitle}`,
    body: `Le code de présence est : ${code}. Vous avez 15 minutes !`,
    data: {
      type: "attendance",
      code: code,
      trainingId: trainingId, // Pour la redirection au clic
    },
  }));

  try {
    const response = await axios.post(
      "https://exp.host/--/api/v2/push/send",
      messages,
      {
        headers: {
          Accept: "application/json",
          "Accept-encoding": "gzip, deflate",
          "Content-Type": "application/json",
        },
      },
    );
    console.log("Réponse push:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Erreur d'envoi Push via Axios:",
      error.response?.data || error.message,
    );
    throw error;
  }
}
