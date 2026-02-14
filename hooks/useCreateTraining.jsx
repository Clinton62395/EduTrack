import { useAuth } from "@/components/constants/authContext";
import { uploadToCloudinary } from "@/components/helpers/useTrainingImagaUpload";
import { yupResolver } from "@hookform/resolvers/yup";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { buildTraining } from "../components/helpers/buildTraining";
import { trainingCreateSchema } from "../components/validators/validate.training.modal";

export function useCreateOrUpdateTraining({
  onCreate,
  onUpdate,
  onClose,
  showMessage,
  existingTraining = null,
}) {
  const { user } = useAuth();
  const [coverImage, setCoverImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(trainingCreateSchema),
    defaultValues: {
      status: existingTraining?.status || "planned",
      startDate: existingTraining?.startDate
        ? new Date(existingTraining.startDate)
        : undefined,
      endDate: existingTraining?.endDate
        ? new Date(existingTraining.endDate)
        : undefined,
      maxLearners: existingTraining?.maxLearners || 20,
      price: existingTraining?.price || 0,
      category: existingTraining?.category || "",
      customCategory: existingTraining?.customCategory || "",
      title: existingTraining?.title || "",
      description: existingTraining?.description || "",
    },
  });

  const onSubmit = async (formData) => {
    if (!user) return;
    setLoading(true);

    try {
      if (existingTraining && existingTraining.status !== "planned") {
        showMessage?.(
          "Impossible de mettre à jour",
          `La formation "${existingTraining.title}" ne peut être modifiée que si son statut est 'planned'.`,
        );
        setLoading(false);
        return;
      }
      let uploadedImage = existingTraining?.coverImage || null;

      if (coverImage && coverImage !== existingTraining?.coverImage) {
        uploadedImage = await uploadToCloudinary(coverImage);
      }

      const trainingData = buildTraining({
        formData,
        coverImage: uploadedImage,
        user,
        existingTraining,
      });

      // ✅ Choix automatique entre création et update
      if (existingTraining) {
        await onUpdate(existingTraining.id, trainingData);
      } else {
        await onCreate(trainingData);
      }

      reset();
      setCoverImage(null);
      onClose?.();
    } catch (err) {
      console.error("Erreur soumission formation:", err);
      showMessage?.("Erreur", "Impossible de sauvegarder la formation");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Return en dehors de onSubmit
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
  };
}
