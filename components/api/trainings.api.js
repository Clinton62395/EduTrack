import { db } from "@/components/lib/firabase";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { Alert } from "react-native";

export function useTrainings(user) {
  const [formations, setFormations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;

    const q = query(
      collection(db, "formations"),
      where("formateurId", "==", user.uid),
      orderBy("createdAt", "desc"),
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        setFormations(data);
        setLoading(false);
      },
      () => {
        Alert.alert("Erreur", "Impossible de charger les formations.");
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [user?.uid]);

  const createFormation = async (formationData) => {
    await addDoc(collection(db, "formations"), {
      ...formationData,
      status: formationData.status || "planned",
      formateurId: user.uid,
      formateurName: user.displayName || "Formateur",
      createdAt: serverTimestamp(),
    });
  };

  const deleteFormation = async (id) => {
    await deleteDoc(doc(db, "formations", id));
  };

  return {
    formations,
    loading,
    createFormation,
    deleteFormation,
  };
}
