import { useAuth } from "@/components/constants/authContext";
import { db } from "@/components/lib/firebase";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";

export function useTrainings() {
  const { user } = useAuth();
  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔴 ÉCOUTE FIRESTORE
  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "formations"),
      where("trainerId", "==", user.uid),
    );

    const unsub = onSnapshot(q, (snapshot) => {
      setTrainings(
        snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
          coverImage: d.data().coverImage || null,
        })),
      );
      setLoading(false);
    });

    return unsub;
  }, [user?.uid]);

  // 🔴 CRUD
  const createTraining = async (trainingData) => {
    await addDoc(collection(db, "formations"), trainingData);
  };

  const deleteTraining = async (id) => {
    await deleteDoc(doc(db, "formations", id));
  };

  return {
    trainings,
    loading,
    createTraining,
    deleteTraining,
  };
}
