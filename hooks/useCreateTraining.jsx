import { useAuth } from "@/components/constants/authContext";
import { buildTraining } from "@/components/helpers/buildTraining";
import { uploadToCloudinary } from "@/components/helpers/useTrainingImagaUpload";
import { yupResolver } from "@hookform/resolvers/yup";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { trainingCreateSchema } from "../components/validators/validate.training.modal";

// --- VALIDATION ---

export function useCreateTraining(onCreate, onClose) {
  const { user } = useAuth();
  const [coverImage, setCoverImage] = useState(null);

  // 🔔 Snackbar state
  const [snackVisible, setSnackVisible] = useState(false);
  const [snackMessage, setSnackMessage] = useState("");
  const [snackType, setSnackType] = useState("success");

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
      startDate: new Date(),
      endDate: new Date(),
      maxLearners: 20,
      price: 0,
    },
  });

  const showSnack = (message, type = "success") => {
    setSnackMessage(message);
    setSnackType(type);
    setSnackVisible(true);
  };

  const dismissSnack = () => {
    setSnackVisible(false);
  };

  const onSubmit = async (formData) => {
    if (!user) {
      showSnack("Connexion requise", "error");
      return;
    }

    try {
      let uploadedImage = null;

      if (coverImage) {
        uploadedImage = await uploadToCloudinary(coverImage);
      }

      const trainingData = buildTraining({
        formData,
        coverImage: uploadedImage,
        user,
      });

      await onCreate(trainingData);

      showSnack("Formation créée avec succès", "success");

      reset();
      setCoverImage(null);
      if (onClose) onClose();
    } catch (err) {
      console.error(err);
      showSnack("Impossible de créer la formation. Réessayez.", "error");
    }
  };

  return {
    // Form
    control,
    errors,
    handleSubmit,
    onSubmit,
    loading,
    coverImage,
    setCoverImage,
    setValue,

    // Snackbar
    snackVisible,
    snackMessage,
    snackType,
    dismissSnack,
  };
}
