// useUpdateFormation.ts
import { db } from "@/components/lib/firebase";
import { yupResolver } from "@hookform/resolvers/yup";
import { doc, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { uploadToCloudinary } from "../components/helpers/useTrainingImagaUpload";

// Schéma Yup pour validation
const formationUpdateSchema = yup.object({
  title: yup.string().required("Titre requis").min(3, "Titre trop court"),
  description: yup.string(),
  category: yup.string().required("Catégorie requise"),
  maxLearners: yup
    .number()
    .typeError("Doit être un nombre")
    .positive("Doit être positif")
    .integer("Doit être entier")
    .required("Nombre max requis"),
  price: yup
    .number()
    .typeError("Doit être un nombre")
    .min(0, "Prix invalide")
    .required("Prix requis"),
});

export function useUpdateTraining(initialData, onClose) {
  const [coverImage, setCoverImage] = useState(initialData.coverImage || null);
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: initialData.title || "",
      description: initialData.description || "",
      category: initialData.category || "",
      maxLearners: initialData.maxLearners || 0,
      price: initialData.price || 0,
    },
    resolver: yupResolver(formationUpdateSchema),
  });

  useEffect(() => {
    reset({
      title: initialData.title || "",
      description: initialData.description || "",
      category: initialData.category || "",
      maxLearners: initialData.maxLearners || 0,
      price: initialData.price || 0,
    });
    setCoverImage(initialData.coverImage || null);
  }, [initialData]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      let imageUrl = coverImage;

      // Si l'image est une nouvelle URI locale, upload sur Cloudinary
      if (coverImage && !coverImage.startsWith("https://")) {
        imageUrl = await uploadToCloudinary(coverImage);
      }

      const formationRef = doc(db, "formations", initialData.id);
      await updateDoc(formationRef, {
        ...data,
        coverImage: imageUrl,
      });

      onClose();
    } catch (err) {
      console.error("Erreur mise à jour formation :", err);
    } finally {
      setLoading(false);
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
  };
}
