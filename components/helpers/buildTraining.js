import { serverTimestamp } from "firebase/firestore";
import { nanoid } from "nanoid";

// --- Générateurs ---
export const generateInvitationCode = () => nanoid(8).toUpperCase();
export const generateMasterCode = () => nanoid(8).toUpperCase();

// --- Factory Formation ---
export function buildTraining({
  formData,
  coverImage,
  user,
  existingTraining = null,
}) {
  // 🔵 Gestion catégorie - ICI c'est bien !
  const isOther = formData.category === "other";
  // 🔵 Sécurité

  // 🔵 CORRECTION: Gérer les nombres proprement
  const maxLearners = formData.maxLearners ? Number(formData.maxLearners) : 20;
  const price = formData.price ? Number(formData.price) : 0;

  return {
    ...(existingTraining || {}),
    title: formData.title,
    description: formData.description || "",
    category: isOther ? formData.customCategory?.trim() : formData.category,
    customCategory: isOther ? formData.customCategory?.trim() : "",
    status: formData.status || "planned",

    startDate: formData.startDate?.toISOString() || null,
    endDate: formData.endDate?.toISOString() || null,

    maxLearners,
    price,

    coverImage: coverImage || null,

    trainerId: user.uid,
    trainerName: user.name || user.email?.split("@")[0] || "Formateur",

    invitationCode:
      existingTraining?.invitationCode || generateInvitationCode(),

    masterCode: existingTraining?.masterCode || generateMasterCode(),

    currentLearners: existingTraining?.currentLearners || 0,

    participants: existingTraining?.participants || [],

    createdAt: existingTraining?.createdAt || serverTimestamp(),

    updatedAt: serverTimestamp(),
  };
}
