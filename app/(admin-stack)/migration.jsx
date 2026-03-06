import { db } from "@/components/lib/firebase";

export default function MigrationPage() {
  const runMigration = async () => {
    try {
      console.log("Début de la migration...");
      const snapshot = await db.collection("formations").get();

      const batch = db.batch(); // Utilise un batch pour la performance et la sécurité
      let count = 0;

      snapshot.docs.forEach((doc) => {
        const data = doc.data();

        // On vérifie si le premier élément est un objet (ancienne structure)
        if (
          Array.isArray(data.participants) &&
          typeof data.participants[0] === "object"
        ) {
          // On extrait l'ID (adapte 'uid' ou 'id' selon ton ancien objet)
          const flatIds = data.participants.map((p) => p.uid || p.id);

          const docRef = db.collection("formations").doc(doc.id);
          batch.update(docRef, { participants: flatIds });
          count++;
        }
      });

      if (count > 0) {
        await batch.commit();
        alert(`${count} formations mises à jour avec succès !`);
      } else {
        alert("Aucune formation à migrer trouvée.");
      }
    } catch (error) {
      console.error("Erreur de migration :", error);
      alert("Erreur, regarde la console.");
    }
  };

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h1>Outil de Migration Firestore</h1>
      <p>Transforme participants [Object] en [String]</p>
      <button
        onClick={runMigration}
        style={{ padding: "10px 20px", cursor: "pointer" }}
      >
        Lancer la migration maintenant
      </button>
    </div>
  );
}
