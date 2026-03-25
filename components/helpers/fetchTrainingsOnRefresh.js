import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { db } from "../lib/firebase";

export const getTrainingsFromDB = async (userId) => {
  try {
    const trainingsRef = collection(db, "trainings");
    const q = query(
      trainingsRef,
      where("trainerId", "==", userId),
      orderBy("createdAt", "desc"),
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Erreur Firestore :", error);
    throw error;
  }
};
