import { db } from "@/components/lib/firebase";
import {
  collection,
  getDocs,
  query,
  where,
} from "@react-native-firebase/firestore";

/**
 * Vérifie le code d'invitation et récupère la formation correspondante
 */
export const verifyInvitationCode = async (invitationCode) => {
  const snapshot = await getDocs(
    query(
      collection(db, "formations"),
      where("invitationCode", "==", invitationCode),
    ),
  );

  if (snapshot.empty) {
    throw new Error("Code d'invitation invalide");
  }

  const formation = snapshot.docs[0].data();
  return {
    formationId: snapshot.docs[0].id,
    trainerId: formation.formateurId,
  };
};
