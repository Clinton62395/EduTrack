import { db } from "@/components/lib/firebase";
import * as FileSystem from "expo-file-system/legacy";
import { useEffect, useState } from "react";

export function useLearnerResources(userId) {
  const [trainingsWithModules, setTrainingsWithModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingIds, setDownloadingIds] = useState([]);

  // Fonction pour générer le chemin local unique d'un fichier
  const getLocalUri = (lessonId, remoteUrl) => {
    // On nettoie l'ID de la leçon pour éviter les caractères spéciaux
    const safeId = lessonId.replace(/[^a-z0-9]/gi, "_");

    // On force l'extension .pdf ou on extrait proprement la dernière
    const extension = "pdf";

    // On retourne un chemin plat dans le dossier racine de l'app
    return `${FileSystem.documentDirectory}res_${safeId}.${extension}`;
  };

  useEffect(() => {
    if (!userId) return;

    // Écoute temps réel des formations où l'élève est inscrit
    const unsub = db
      .collection("formations")
      .where("participants", "array-contains", userId)
      .onSnapshot(async (snapshot) => {
        const trainingsData = [];

        for (const trainingDoc of snapshot.docs) {
          const modulesSnap = await trainingDoc.ref
            .collection("modules")
            .orderBy("order", "asc")
            .get();
          const modulesList = [];

          for (const moduleDoc of modulesSnap.docs) {
            const lessonsSnap = await moduleDoc.ref
              .collection("lessons")
              .orderBy("order", "asc")
              .get();
            const lessons = lessonsSnap.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));

            modulesList.push({
              id: moduleDoc.id,
              ...moduleDoc.data(),
              lessons,
            });
          }

          trainingsData.push({
            id: trainingDoc.id,
            ...trainingDoc.data(),
            modules: modulesList,
          });
        }
        setTrainingsWithModules(trainingsData);
        setLoading(false);
      });

    return unsub;
  }, [userId]);

  // Logique de téléchargement d'un fichier unique
  const downloadFile = async (lessonId, fileUrl) => {
    if (!fileUrl) return;
    const localUri = getLocalUri(lessonId, fileUrl);

    try {
      setDownloadingIds((prev) => [...prev, lessonId]);
      const result = await FileSystem.downloadAsync(fileUrl, localUri);
      return result.uri;
    } catch (error) {
      console.error("Download Error:", error);
      throw error;
    } finally {
      setDownloadingIds((prev) => prev.filter((id) => id !== lessonId));
    }
  };

  return {
    trainingsWithModules,
    loading,
    downloadFile,
    downloadingIds,
    getLocalUri,
  };
}
