import { db } from "@/components/lib/firebase";
import {
  collection,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  where,
} from "@react-native-firebase/firestore";
import * as FileSystem from "expo-file-system/legacy";
import { useEffect, useState } from "react";

export function useLearnerResources(userId) {
  const [trainingsWithModules, setTrainingsWithModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingIds, setDownloadingIds] = useState([]);

  // ─────────────────────────────────────────
  // 📁 Chemin local unique par fichier
  // ─────────────────────────────────────────
  const getLocalUri = (lessonId) => {
    const safeId = lessonId.replace(/[^a-z0-9]/gi, "_");
    return `${FileSystem.documentDirectory}res_${safeId}.pdf`;
  };

  // ─────────────────────────────────────────
  // 📡 Formations + modules + leçons temps réel
  // ─────────────────────────────────────────
  useEffect(() => {
    if (!userId) return;

    const unsub = onSnapshot(
      query(
        collection(db, "formations"),
        where("participants", "array-contains", userId),
      ),
      async (snapshot) => {
        try {
          const trainingsData = await Promise.all(
            snapshot.docs.map(async (trainingDoc) => {
              // Modules ordonnés
              const modulesSnap = await getDocs(
                query(
                  collection(db, "formations", trainingDoc.id, "modules"),
                  orderBy("order", "asc"),
                ),
              );

              // Leçons de chaque module en parallèle
              const modulesList = await Promise.all(
                modulesSnap.docs.map(async (moduleDoc) => {
                  const lessonsSnap = await getDocs(
                    query(
                      collection(
                        db,
                        "formations",
                        trainingDoc.id,
                        "modules",
                        moduleDoc.id,
                        "lessons",
                      ),
                      orderBy("order", "asc"),
                    ),
                  );

                  return {
                    id: moduleDoc.id,
                    ...moduleDoc.data(),
                    lessons: lessonsSnap.docs.map((d) => ({
                      id: d.id,
                      ...d.data(),
                    })),
                  };
                }),
              );

              return {
                id: trainingDoc.id,
                ...trainingDoc.data(),
                modules: modulesList,
              };
            }),
          );

          setTrainingsWithModules(trainingsData);
        } catch (error) {
          console.error("Erreur chargement ressources:", error);
        } finally {
          setLoading(false);
        }
      },
    );

    return () => unsub();
  }, [userId]);

  // ─────────────────────────────────────────
  // 📥 Téléchargement d'un fichier
  // ─────────────────────────────────────────
  const downloadFile = async (lessonId, fileUrl) => {
    if (!fileUrl) return;
    const localUri = getLocalUri(lessonId);

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
