import { onRequest } from "firebase-functions/v2/https";
import admin from "firebase-admin";
import corsLib from "cors";
import initPaymentController from "./src/controllers/initPayment.controller";
admin.initializeApp();
const cors = corsLib({ origin: true });

export const initPayment = onRequest((req, res) => {
  initPaymentController.initPaymentController(req, res, cors);
});

// Ton webhook sera ici aussi
export const paymentWebhook = onRequest(async (req, res) => {
  await initPaymentController.paymentWebhookController(req, res);
});