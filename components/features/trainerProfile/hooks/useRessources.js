// ─────────────────────────────────────────
// hooks/useResources.js
// ─────────────────────────────────────────
import { db } from "@/components/lib/firebase";
import firestore from "@react-native-firebase/firestore";
import { useState } from "react";
// using db for refs and firestore.FieldValue for arrays

/**
 * Gestion des ressources d'une formation.
 * Les ressources sont stockées comme un array sur le document formation :
 * formations/{formationId}.resources = [{ name, type, url }]
 *
 * @param {string} formationId
 */
export function useResources(formationId) {
  const [loading, setLoading] = useState(false);

  const formationRef = db.collection("formations").doc(formationId);

  // ── Ajouter une ressource ──
  const addResource = async (resource) => {
    if (!resource.name?.trim() || !resource.url?.trim()) return false;

    try {
      setLoading(true);
      await formationRef.update({
        resources: firestore.FieldValue.arrayUnion({
          name: resource.name.trim(),
          type: resource.type || "pdf",
          url: resource.url.trim(),
        }),
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
      await formationRef.update({
        resources: firestore.FieldValue.arrayRemove(resource),
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
