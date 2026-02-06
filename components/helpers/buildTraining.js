import { nanoid } from "nanoid";

// --- Générateurs ---
export const generateInvitationCode = () => nanoid(8).toUpperCase();
export const generateMasterCode = () => nanoid(8).toUpperCase();

// --- Factory Formation ---
export function buildTraining({ formData, coverImage, user }) {
  return {
    title: formData.title,
    description: formData.description,
    category: formData.category,
    status: formData.status || "planned",

    startDate: formData.startDate.toISOString(),
    endDate: formData.endDate.toISOString(),

    maxLearners: Number(formData.maxLearners),
    price: Number(formData.price),

    coverImage: coverImage || null,

    trainerId: user.uid,
    trainerName: user.displayName || user.email,

    invitationCode: generateInvitationCode(),
    masterCode: generateMasterCode(),

    currentLearners: 0,
    participants: [],
    createdAt: new Date().toISOString(),
  };
}
