import {
  collection,
  deleteField,
  doc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { db } from "../components/lib/firebase";

export async function migrateImageField() {
  try {
    const formationsRef = collection(db, "formations");
    const snapshot = await getDocs(formationsRef);

    let updated = 0;

    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();

      // Si imageUrl existe mais pas coverImage
      if (data.imageUrl && !data.coverImage) {
        await updateDoc(doc(db, "formations", docSnap.id), {
          coverImage: data.imageUrl,
          imageUrl: deleteField(), // ← supprime l'ancien champ
        });
        updated++;
        console.log(`✅ Formation ${docSnap.id} migrée`);
      }
    }

    console.log(`🎉 ${updated} formations migrées`);
  } catch (error) {
    console.error("❌ Erreur migration:", error);
  }
}
