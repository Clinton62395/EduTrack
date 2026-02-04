import { useAuth } from "@/components/constants/authContext";
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
export function useTrainings() {
  const [formations, setFormations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth(); // ✅ contexte global
  useEffect(() => {
    // Si le contexte auth a fini de vérifier mais qu'il n'y a pas d'utilisateur
    if (authLoading) return;
    // 1. CONDITION DE SÉCURITÉ :
    // Si l'objet user n'est pas encore chargé ou si l'UID est manquant, on arrête là.
    if (!user?.uid) {
      setFormations([]);
      console.log("Attente de l'utilisateur...");
      return;
    }

    setLoading(true);

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

  // Dans useTrainings.js
  const createFormation = async (formationData) => {
    try {
      await addDoc(collection(db, "formations"), {
        ...formationData,
        status: formationData.status || "planned",
        formateurId: user.uid,
        formateurName: user.displayName || "Formateur",
        // On initialise les champs requis par le PRD pour le suivi
        currentLearners: 0,
        attendanceRate: 0,
        progressionRate: 0,
        completedModules: 0,
        createdAt: serverTimestamp(),
      });
    } catch (e) {
      Alert.alert("Erreur", "Impossible de sauvegarder la formation.");
    }
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
