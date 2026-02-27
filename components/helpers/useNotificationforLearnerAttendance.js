import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

// 🔥 Fonction pour envoyer un push notification à un utilisateur

//  🔥 Fonction pour récupérer le token de notification
export async function registerForPushNotificationsAsync(userId) {
  let token;

  // 1. Vérifier si c'est un appareil physique
  if (!Device.isDevice) {
    console.log(
      "Les notifications nécessitent un appareil physique (Emulateur détecté)",
    );
    return null; // Retourne null au lieu de undefined
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

    // 2. Récupérer le token (Ajoute ton projectId ici !)
    token = (
      await Notifications.getExpoPushTokenAsync({
        projectId: "03922016-5439-4bb9-9fae-f5a8018b0b25",
      })
    ).data;

    // 3. SECURITÉ : On n'update Firebase que si on a un token
    if (userId && token) {
      await updateDoc(doc(db, "users", userId), {
        expoPushToken: token,
      });
    }

    return token;
  } catch (error) {
    console.error("Erreur lors de l'enregistrement du token:", error);
    return null;
  }
}

// 🔥 Fonction pour envoyer une notification groupée avec Axios
// helpers/useNotificationforLearnerAttendance.js
export async function broadcastNotification(tokens, trainingTitle, code) {
  const messages = tokens.map((token) => ({
    to: token,
    sound: "default",
    title: `Appel : ${trainingTitle}`,
    body: `Le code de présence est : ${code}. Valable 15 minutes.`,
    data: { trainingTitle, code, type: "ATTENDANCE" },
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
    console.log("Expo Response:", result);
  } catch (error) {
    console.error("Erreur Push Expo:", error);
  }
}
