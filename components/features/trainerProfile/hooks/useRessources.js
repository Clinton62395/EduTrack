import { db } from "@/components/lib/firebase";
import {
  arrayRemove,
  arrayUnion,
  doc,
  serverTimestamp,
  updateDoc,
} from "@react-native-firebase/firestore";
import { useState } from "react";

export function useResources(formationId) {
  const [loading, setLoading] = useState(false);

  const formationRef = () => {
    if (!formationId) throw new Error("formationId est requis");
    return doc(db, "formations", formationId);
  };

  // ── Ajouter une ressource ──
  const addResource = async (resource) => {
    if (!resource.name?.trim() || !resource.url?.trim()) return false;
    try {
      setLoading(true);
      await updateDoc(formationRef(), {
        resources: arrayUnion({
          name: resource.name.trim(),
          type: resource.type || "pdf",
          url: resource.url.trim(),
        }),
        updatedAt: serverTimestamp(),
      });
      return true;
    } catch (error) {
      console.error("Erreur ajout ressource:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // ── Supprimer une ressource ──
  const deleteResource = async (resource) => {
    try {
      setLoading(true);
      await updateDoc(formationRef(), {
        resources: arrayRemove(resource),
        updatedAt: serverTimestamp(),
      });
      return true;
    } catch (error) {
      console.error("Erreur suppression ressource:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { addResource, deleteResource, loading };
}
