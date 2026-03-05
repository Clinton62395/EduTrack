// Dans useModules.js — ajoute cette fonction helper
import { db } from "../../lib/firebase"; // using db collection/doc methods
export const sendModuleNotification = async (moduleTitle, formationId) => {
  try {
    // 1. Récupère les participants de la formation
    const formationSnap = await db
      .collection("formations")
      .doc(formationId)
      .get();
    if (!formationSnap.exists) return;

    const participants = formationSnap.data().participants || [];
    if (participants.length === 0) return;

    // 2. Récupère les tokens de chaque participant
    const tokens = [];
    for (const userId of participants) {
      const userSnap = await db.collection("users").doc(userId).get();
      if (userSnap.exists) {
        const userData = userSnap.data();

        // ← Vérifie que l'user veut recevoir les notifs formations
        const wantsFormationNotifs =
          userData?.notificationPrefs?.formations ?? true;
        const wantsPush = userData?.notificationPrefs?.push ?? true;

        if (wantsPush && wantsFormationNotifs && userData.expoPushToken) {
          tokens.push(userData.expoPushToken);
        }
      }
    }

    if (tokens.length === 0) return;

    // 3. Envoie la notification via Expo Push API
    await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(
        tokens.map((token) => ({
          to: token,
          title: "📚 Nouveau module disponible !",
          body: `Un nouveau module "${moduleTitle}" vient d'être ajouté à votre formation.`,
          data: { formationId, moduleTitle },
          sound: "default",
          priority: "high",
        })),
      ),
    });
  } catch (error) {
    console.error("Erreur envoi notification module:", error);
    // On ne throw pas — l'erreur de notification ne doit pas bloquer la création
  }
};
