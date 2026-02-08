// useUpdateFormation.ts
import { db } from "@/components/lib/firebase";
import { yupResolver } from "@hookform/resolvers/yup";
import { doc, serverTimestamp, Timestamp, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { formationCategories } from "../components/features/trainerProfile/trainerDataMock";
import { uploadToCloudinary } from "../components/helpers/useTrainingImagaUpload";

// Schéma Yup pour validation
const formationUpdateSchema = yup.object({
  title: yup.string().required("Titre requis").min(3, "Titre trop court"),
  description: yup.string(),

  category: yup.string().required("Catégorie requise"),
  customCategory: yup.string().when("category", {
    is: "other",
    then: (schema) =>
      schema.required("Veuillez préciser la catégorie").min(3, "Trop court"),
    otherwise: (schema) => schema.notRequired(),
  }),
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
  startDate: yup.string().when("status", {
    is: "planned",
    then: (s) => s.required("Date de début requise"),
    otherwise: (s) => s.notRequired(),
  }),

  endDate: yup.string().when("status", {
    is: "planned",
    then: (s) => s.required("Date de fin requise"),
    otherwise: (s) => s.notRequired(),
  }),
});

export function useUpdateTraining(initialData, onClose) {
  const [coverImage, setCoverImage] = useState(initialData.coverImage || null);
  const [loading, setLoading] = useState(false);

  const {
    control,
    watch,
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
      customCategory: "",
      status: initialData.status || "planned",
      startDate: initialData.startDate || "",
      endDate: initialData.endDate || "",
    },
    resolver: yupResolver(formationUpdateSchema),
  });

  useEffect(() => {
    const isKnownCategory = formationCategories.find(
      (c) => c.value === initialData.category,
    );
    const formatDate = (date) => {
      if (!date) return "";
      const d = date.toDate ? date.toDate() : new Date(date); // gère Timestamp et string
      return d.toISOString().split("T")[0]; // YYYY-MM-DD
    };
    reset({
      title: initialData.title || "",
      description: initialData.description || "",
      category: isKnownCategory ? initialData.category : "other",
      customCategory: isKnownCategory ? "" : initialData.category,
      maxLearners: initialData.maxLearners || 0,
      price: initialData.price || 0,
      startDate: formatDate(initialData.startDate),
      endDate: formatDate(initialData.endDate),
    });
    setCoverImage(initialData.coverImage || null);
  }, [initialData]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      let imageUrl = coverImage;
      let startDate = null;
      let endDate = null;

      // Si l'image est une nouvelle URI locale, upload sur Cloudinary
      if (coverImage && !coverImage.startsWith("https://")) {
        imageUrl = await uploadToCloudinary(coverImage);
      }

      // mettre a jour la catégorie si c'est une autre catégorie
      const finalCategory =
        data.category === "other" ? data.customCategory : data.category;

      //

      if (initialData.status === "planned") {
        startDate = Timestamp.fromDate(new Date(data.startDate));
        endDate = Timestamp.fromDate(new Date(data.endDate));
      }

      const formationRef = doc(db, "formations", initialData.id);
      await updateDoc(formationRef, {
        ...data,
        coverImage: imageUrl,
        category: finalCategory,
        startDate,
        endDate,

        updatedAt: serverTimestamp(),
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
    watch,
    handleSubmit,
    onSubmit,
    errors,
    loading,
    coverImage,
    setCoverImage,
  };
}
