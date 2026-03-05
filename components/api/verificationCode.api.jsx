import { db } from "@/components/lib/firebase"; // firestore via db methods

/**
 * Vérifie le code d'invitation et récupère la formation correspondante
 */
export const verifyInvitationCode = async (invitationCode) => {
  const q = db
    .collection("formations")
    .where("invitationCode", "==", invitationCode);
  const snapshot = await q.get();

  if (snapshot.empty) {
    throw new Error("Code d'invitation invalide");
  }

  const formation = snapshot.docs[0].data();
  return {
    formationId: snapshot.docs[0].id,
    trainerId: formation.formateurId,
  };
};
