// hooks/useModules.js
import { db } from "@/components/lib/firebase";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { Alert } from "react-native";

export function useModules(formationId) {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!formationId) return;

    // On récupère les modules triés par ordre (important pour le programme)
    const q = query(
      collection(db, "formations", formationId, "modules"),
      orderBy("order", "asc"),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setModules(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [formationId]);

  const addModule = async (title) => {
    try {
      await addDoc(collection(db, "formations", formationId, "modules"), {
        title,
        order: modules.length + 1,
        createdAt: serverTimestamp(),
      });
    } catch (e) {
      console.error("Erreur ajout module:", e);
    }
  };
  const deleteModule = async (moduleId) => {
    Alert.alert("Supprimer", "Supprimer ce module ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Supprimer",
        style: "destructive",
        onPress: async () => {
          await deleteDoc(
            doc(db, "formations", formationId, "modules", moduleId),
          );
        },
      },
    ]);
  };

  return { modules, loading, addModule, deleteModule };
}
