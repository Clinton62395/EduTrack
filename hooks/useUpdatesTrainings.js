// useUpdateFormation.ts
import { db } from "@/components/lib/firebase";
import { yupResolver } from "@hookform/resolvers/yup";
import { doc, serverTimestamp, Timestamp, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { formationCategories } from "../components/features/trainerProfile/trainerDataMock";
import { uploadToCloudinary } from "../components/helpers/useTrainingImagaUpload";
import { trainingUpdateSchema } from "../components/validators/validate.training.modal";

// Schéma Yup pour validation

export function useUpdateTraining(initialData, onClose) {
  const [coverImage, setCoverImage] = useState(initialData.coverImage ?? null);

  const isPlanned = initialData.status === "planned";

  // --- Snackbar state ---
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
    formState: { errors, isSubmitting: loading },
  } = useForm({
    defaultValues: {
      title: initialData.title ?? "",
      description: initialData.description ?? "",
      category: initialData.category ?? "",
      customCategory: "",
      startDate: initialData.startDate ?? new Date(),
      endDate: initialData.endDate ?? new Date(),
      price: initialData.price ?? 0,
      maxLearners: initialData.maxLearners ?? 0,
    },
    resolver: yupResolver(trainingUpdateSchema),
  });

  useEffect(() => {
    const isKnownCategory = formationCategories.some(
      (c) => c.value === initialData.category,
    );

    reset({
      title: initialData.title ?? "",
      description: initialData.description ?? "",
      category: isKnownCategory ? initialData.category : "other",
      customCategory: isKnownCategory ? "" : initialData.category,
      startDate: initialData.startDate ?? "",
      endDate: initialData.endDate ?? "",
      price: initialData.price ?? 0,
      maxLearners: initialData.maxLearners ?? 0,
    });

    setCoverImage(initialData.coverImage ?? null);
  }, [initialData]);

  const onSubmit = async (data) => {
    try {
      let imageUrl = coverImage;

      if (coverImage && !coverImage.startsWith("https://")) {
        imageUrl = await uploadToCloudinary(coverImage);
      }

      const updatePayload = {
        title: data.title,
        description: data.description,
        coverImage: imageUrl,
        updatedAt: serverTimestamp(),
      };

      if (isPlanned) {
        updatePayload.category =
          data.category === "other" ? data.customCategory : data.category;
        updatePayload.price = data.price;
        updatePayload.maxLearners = data.maxLearners;
        updatePayload.startDate = Timestamp.fromDate(new Date(data.startDate));
        updatePayload.endDate = Timestamp.fromDate(new Date(data.endDate));
      }

      const formationRef = doc(db, "formations", initialData.id);
      await updateDoc(formationRef, updatePayload);

      showSnack("Formation mise à jour avec succès", "success");
      if (onClose) onClose();
    } catch (error) {
      console.error("Erreur update formation :", error);
      showSnack("Impossible de mettre à jour la formation", "error");
    }
  };

  return {
    control,
    handleSubmit,
    onSubmit,
    errors,
    loading,
    coverImage,
    setCoverImage,
    isPlanned,

    // --- Snackbar props ---
    snackVisible,
    snackMessage,
    snackType,
    dismissSnack,
  };
}
