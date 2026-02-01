import { db } from "@/components/lib/firabase";
import { collection, getDocs, query, where } from "firebase/firestore";

/**
 * Vérifie le code d'invitation et récupère la formation correspondante
 */
export const verifyInvitationCode = async (invitationCode) => {
  const formationRef = collection(db, "formations");
  const q = query(formationRef, where("invitationCode", "==", invitationCode));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    throw new Error("Code d'invitation invalide");
  }

  const formation = snapshot.docs[0].data();
  return {
    formationId: snapshot.docs[0].id,
    trainerId: formation.formateurId,
  };
};
