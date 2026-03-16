/**
 * SCRIPT DE MIGRATION — Formations
 *
 * À exécuter UNE SEULE FOIS depuis un écran de dev ou la console.
 * Aligne tous les documents "formations" sur le nouveau système de statut.
 *
 * Règles de migration :
 *   "planned"  → "draft"      (formation pas encore publiée)
 *   "ongoing"  → "published"  (formation active = publiée)
 *   "completed"→ "archived"   (formation terminée = archivée)
 *   undefined  → "draft"      (aucun statut = brouillon)
 *   "draft" / "published" / "archived" → inchangé ✅
 *
 * Corrections supplémentaires :
 *   - codeActive: false si status devient "draft" ou "archived"
 *   - codeActive: true  si status reste "published"
 */

import { db } from "@/components/lib/firebase";
import {
  collection,
  doc,
  getDocs,
  serverTimestamp,
  writeBatch,
} from "@react-native-firebase/firestore";

const STATUS_MAP = {
  planned: "draft",
  ongoing: "published",
  completed: "archived",
};

const NEW_STATUSES = new Set(["draft", "published", "archived"]);

export async function migrateFormationStatuses() {
  console.log("🚀 Début migration statuts formations...");

  try {
    const snapshot = await getDocs(collection(db, "formations"));

    if (snapshot.empty) {
      console.log("ℹ️ Aucune formation trouvée.");
      return { migrated: 0, skipped: 0, errors: 0 };
    }

    let migrated = 0;
    let skipped = 0;
    let errors = 0;

    // Firestore writeBatch limite à 500 opérations
    // On découpe si nécessaire
    const BATCH_SIZE = 400;
    let batch = writeBatch(db);
    let batchCount = 0;

    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      const currentStatus = data.status;

      // ✅ Déjà dans le nouveau système — on skip
      if (currentStatus && NEW_STATUSES.has(currentStatus)) {
        console.log(
          `⏭️ Skip ${docSnap.id} — status "${currentStatus}" déjà correct`,
        );
        skipped++;
        continue;
      }

      // Calcul du nouveau statut
      const newStatus = STATUS_MAP[currentStatus] || "draft";
      const newCodeActive =
        newStatus === "published" ? (data.codeActive ?? true) : false;

      console.log(
        `🔄 Migration ${docSnap.id} : "${currentStatus || "undefined"}" → "${newStatus}" | codeActive: ${newCodeActive}`,
      );

      try {
        batch.update(doc(db, "formations", docSnap.id), {
          status: newStatus,
          codeActive: newCodeActive,
          migratedAt: serverTimestamp(),
        });

        migrated++;
        batchCount++;

        // Commit par tranche de 400
        if (batchCount >= BATCH_SIZE) {
          await batch.commit();
          console.log(`✅ Batch de ${batchCount} opérations commité`);
          batch = writeBatch(db);
          batchCount = 0;
        }
      } catch (err) {
        console.error(`❌ Erreur sur ${docSnap.id}:`, err);
        errors++;
      }
    }

    // Commit du dernier batch
    if (batchCount > 0) {
      await batch.commit();
      console.log(`✅ Dernier batch de ${batchCount} opérations commité`);
    }

    const summary = { migrated, skipped, errors };
    console.log("🎉 Migration terminée :", summary);
    return summary;
  } catch (err) {
    console.error("💥 Erreur migration:", err);
    throw err;
  }
}
