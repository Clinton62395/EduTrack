import { db } from "@/components/lib/firebase";
import {
  arrayUnion,
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";

export function useJoinTraining() {
  const joinByCode = async (code, userId) => {
    // 1. Chercher la formation qui a ce code
    const q = query(
      collection(db, "formations"),
      where("invitationCode", "==", code.trim().toUpperCase()),
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      throw new Error("Code invalide. Vérifiez le code avec votre formateur.");
    }

    const formationDoc = querySnapshot.docs[0];
    const formationData = formationDoc.data();

    // 2. Vérifications de sécurité
    if (formationData.participants.includes(userId)) {
      throw new Error("Vous êtes déjà inscrit à cette formation.");
    }

    if (formationData.currentLearners >= formationData.maxLearners) {
      throw new Error(
        "Cette formation a atteint son nombre maximum de participants.",
      );
    }

    // 3. Inscription
    const formationRef = doc(db, "formations", formationDoc.id);
    await updateDoc(formationRef, {
      participants: arrayUnion(userId),
      currentLearners: formationData.currentLearners + 1,
    });

    return { id: formationDoc.id, title: formationData.title };
  };

  return { joinByCode };
}
