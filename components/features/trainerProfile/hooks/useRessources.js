import { db } from "@/components/lib/firebase"; // Instance firestore() native
import firestore from "@react-native-firebase/firestore"; // Pour les utilitaires statiques
import { useState } from "react";

/**
 * Gestion des ressources d'une formation (Natif).
 * Stockées dans un array : formations/{formationId}.resources = [{ name, type, url }]
 */
export function useResources(formationId) {
  const [loading, setLoading] = useState(false);

  // 🔹 Helper de référence sécurisé
  const getFormationRef = () => {
    if (!formationId)
      throw new Error("formationId est requis pour gérer les ressources");
    return db.collection("formations").doc(formationId);
  };

  // ── Ajouter une ressource (Atomique) ──
  const addResource = async (resource) => {
    if (!resource.name?.trim() || !resource.url?.trim()) return false;

    try {
      setLoading(true);
      await getFormationRef().update({
        // ✅ arrayUnion natif : évite les conflits d'écriture
        resources: firestore.FieldValue.arrayUnion({
          name: resource.name.trim(),
          type: resource.type || "pdf",
          url: resource.url.trim(),
        }),
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });
      return true;
    } catch (error) {
      console.error("Erreur native ajout ressource:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // ── Supprimer une ressource (Atomique) ──
  const deleteResource = async (resource) => {
    try {
      setLoading(true);
      await getFormationRef().update({
        // ✅ arrayRemove natif : supprime l'objet exact du tableau
        resources: firestore.FieldValue.arrayRemove(resource),
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });
      return true;
    } catch (error) {
      console.error("Erreur native suppression ressource:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { addResource, deleteResource, loading };
}
