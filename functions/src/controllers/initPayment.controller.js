import admin from "firebase-admin";
import initPaymentServices from "../services/initPayment.services";


// ... tes imports
class InitPaymentController {
  initPaymentController = async (req, res, cors) => {
    cors(req, res, async () => {
      try {
        if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

        const { amount, description, userId, trainingId, customer_name, customer_surname } = req.body;
        
        // CRUCIAL : Format de l'ID pour le Webhook
        const transaction_id = `BUY_${userId}_${trainingId}_${Date.now()}`;

        const paymentData = {
          transaction_id,
          amount,
          currency: "XOF",
          description,
          designation: description,
          customer_name: customer_name || "Client",
          customer_surname: customer_surname || "EduTrack",
        };

        const result = await initPaymentServices.generateCinetPayLink(paymentData);
        res.status(200).json(result);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
  };

  paymentWebhookController = async (req, res) => {
    try {
      // Note: CinetPay envoie souvent les données à plat dans req.body
      const { cpm_trans_id, cpm_result } = req.body;

      if (cpm_result !== "00") {
        return res.status(200).send("OK");
      }

      const checkStatus = await initPaymentServices.verifyCinetPayTransaction(cpm_trans_id);

      if (checkStatus.code === "00" && checkStatus.data.status === "ACCEPTED") {
        // Extraction des IDs depuis le transaction_id construit à l'initialisation
        const parts = cpm_trans_id.split('_');
        const userId = parts[1];
        const trainingId = parts[2];

        // Idempotence : Vérifier si l'abonnement existe déjà pour éviter les doublons
        const alreadySubscribed = await admin.firestore()
          .collection("userSubscriptions")
          .where("transactionId", "==", cpm_trans_id)
          .get();

        if (alreadySubscribed.empty) {
          await admin.firestore().collection("userSubscriptions").add({
            userId,
            trainingId,
            purchaseDate: admin.firestore.FieldValue.serverTimestamp(),
            transactionId: cpm_trans_id,
            amount: checkStatus.data.amount,
            status: "active"
          });
          console.log(`✅ Formation ${trainingId} débloquée pour ${userId}`);
        }
      }
      res.status(200).send("OK");
    } catch (error) {
      console.error("❌ Erreur Webhook:", error.message);
      res.status(500).send("Internal Server Error");
    }
  };
}
export default new InitPaymentController();