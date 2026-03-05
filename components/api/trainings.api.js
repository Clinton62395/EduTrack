import { db } from "@/components/lib/firebase";
import firestore from "@react-native-firebase/firestore";
import { useEffect, useState } from "react";
import { Alert } from "react-native";
// Firestore via db; FieldValue for timestamps

export function useTrainings(user) {
  const [formations, setFormations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;

    const q = db
      .collection("formations")
      .where("formateurId", "==", user.uid)
      .orderBy("createdAt", "desc");

    const unsubscribe = q.onSnapshot(
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
    await db.collection("formations").add({
      ...formationData,
      status: formationData.status || "planned",
      formateurId: user.uid,
      formateurName: user.displayName || "Formateur",
      createdAt: firestore.FieldValue.serverTimestamp(),
    });
  };

  const deleteFormation = async (id) => {
    await db.collection("formations").doc(id).delete();
  };

  return {
    formations,
    loading,
    createFormation,
    deleteFormation,
  };
}
