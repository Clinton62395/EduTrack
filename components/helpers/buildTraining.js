import { serverTimestamp } from "firebase/firestore";
import { nanoid } from "nanoid";

// --- Générateurs ---
export const generateInvitationCode = () => nanoid(8).toUpperCase();
export const generateMasterCode = () => nanoid(8).toUpperCase();

// --- Factory Formation ---
export function buildTraining({ formData, coverImage, user }) {
  // 🔵 Gestion catégorie - ICI c'est bien !
  const category =
    formData.category === "other"
      ? formData.customCategory?.trim()
      : formData.category;

  // 🔵 Sécurité
  if (!category) {
    throw new Error("La catégorie est requise");
  }

  // 🔵 CORRECTION: Gérer les nombres proprement
  const maxLearners = formData.maxLearners ? Number(formData.maxLearners) : 20;

  const price = formData.price ? Number(formData.price) : 0;

  return {
    title: formData.title,
    description: formData.description || "",
    category,
    status: formData.status || "planned",

    // 🔵 CORRECTION: Dates en ISO string pour Firestore
    startDate: formData.startDate?.toISOString() || null,
    endDate: formData.endDate?.toISOString() || null,

    maxLearners,
    price,

    coverImage: coverImage || null,

    trainerId: user.uid,
    trainerName: user.fullName || user.email?.split("@")[0] || "Formateur",

    invitationCode: generateInvitationCode(),
    masterCode: generateMasterCode(),

    currentLearners: 0,
    participants: [],
    createdAt: serverTimestamp(), // ✅ OK pour Firestore
  };
}
