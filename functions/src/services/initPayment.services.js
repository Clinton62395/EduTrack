import axios from "axios";


class PaymentService {
  static generateCinetPayLink = async (paymentData) => {
  try {
    const response = await axios.post("https://api-checkout.cinetpay.com/v2/payment", {
      apikey: process.env.CINETPAY_API_KEY,
      site_id: process.env.CINETPAY_SITE_ID,
      notify_url: process.env.CINETPAY_NOTIFY_URL,
      ...paymentData // amount, currency, transaction_id, etc.
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.description || "Erreur CinetPay Service");
  }
};


// Ajoute ceci à ton fichier services existant
static verifyCinetPayTransaction = async (transaction_id) => {
  try {
    const response = await axios.post("https://api-checkout.cinetpay.com/v2/payment/check", {
      apikey: process.env.CINETPAY_API_KEY,
      site_id: process.env.CINETPAY_SITE_ID,
      transaction_id: transaction_id
    });
    return response.data;
  } catch (error) {
    throw new Error("Erreur lors de la vérification CinetPay");
  }
};
}

export default new PaymentService();