import { useAuth } from "@/components/constants/authContext";
import { uploadToCloudinary } from "@/components/helpers/useTrainingImagaUpload";
import { yupResolver } from "@hookform/resolvers/yup";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { buildTraining } from "../components/helpers/buildTraining";
import { trainingCreateSchema } from "../components/validators/validate.training.modal";

export function useCreateTraining(onCreate, onClose) {
  const { user } = useAuth();
  const [coverImage, setCoverImage] = useState(null);
  const [snackVisible, setSnackVisible] = useState(false);
  const [snackMessage, setSnackMessage] = useState("");
  const [snackType, setSnackType] = useState("success");

  const showSnack = (message, type = "success") => {
    setSnackMessage(message);
    setSnackType(type);
    setSnackVisible(true);
  };

  const dismissSnack = () => setSnackVisible(false);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting: loading },
  } = useForm({
    resolver: yupResolver(trainingCreateSchema),
    defaultValues: {
      status: "planned",
      startDate: undefined,
      endDate: undefined,
      maxLearners: 20,
      price: 0,
      category: "",
      customCategory: "",
    },
  });

  const onSubmit = async (formData) => {
    if (!user) {
      showSnack("Vous devez être connecté", "error");
      return;
    }

    try {
      let uploadedImage = null;
      if (coverImage) {
        uploadedImage = await uploadToCloudinary(coverImage);
      }

      // Construire les données avec la catégorie corrigée
      const trainingData = buildTraining({
        formData,
        coverImage: uploadedImage,
        user,
      });

      await onCreate(trainingData);

      // ✅ Succès
      showSnack("Formation créée avec succès", "success");

      // Réinitialiser et fermer APRÈS un délai
      setTimeout(() => {
        reset();
        setCoverImage(null);
        if (onClose) onClose();
      }, 1500);
    } catch (err) {
      console.error("Erreur création formation:", err);
      showSnack("Impossible de créer la formation", "error");
    }
  };

  return {
    control,
    errors,
    handleSubmit,
    onSubmit,
    loading,
    coverImage,
    setCoverImage,
    setValue,
    reset,
    // Snackbar
    snackVisible,
    snackMessage,
    snackType,
    dismissSnack,
  };
}
