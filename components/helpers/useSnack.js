import { useState } from "react";

/**
 * Hook UI indépendant pour feedback utilisateur.
 * Totalement découplé de Firestore.
 */
export function useSnack() {
  const [snack, setSnack] = useState({
    visible: false,
    message: "",
    type: "success",
  });

  const showSnack = (message, type = "success") =>
    setSnack({ visible: true, message, type });

  const dismissSnack = () => setSnack((prev) => ({ ...prev, visible: false }));

  return {
    snack,
    showSnack,
    dismissSnack,
  };
}
