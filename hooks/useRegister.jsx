import { registerUser } from "@/components/api/auth.api";
import { verifyInvitationCode } from "@/components/api/verificationCode.api";
import { useState } from "react";

export function useRegister(reset) {
  const [loading, setLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [error, setError] = useState(false);
  const [email, setEmail] = useState("");

  const onSubmit = async (data) => {
    setError(false);
    setLoading(true);

    try {
      if (data.role === "learner") {
        const { formationId, trainerId } = await verifyInvitationCode(
          data.invitationCode,
        );
        data.formationId = formationId;
        data.trainerId = trainerId;
      }

      await registerUser(data);

      setSnackbarMessage("Compte créé avec succès !");
      setSnackbarVisible(true);
      setOpenModal(true);
      setEmail(data.email);
      reset();
    } catch (err) {
      console.error("❌ Registration error:", err);
      setError(true);
      setSnackbarMessage(err.message || "Erreur lors de l'inscription");
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    snackbarVisible,
    snackbarMessage,
    openModal,
    error,
    email,
    setSnackbarVisible,
    setOpenModal,
    onSubmit,
  };
}
