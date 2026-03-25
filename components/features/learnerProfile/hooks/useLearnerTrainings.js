import { db } from "@/components/lib/firebase";
import {
  collection,
  onSnapshot,
  query,
  where,
} from "@react-native-firebase/firestore";
import { useEffect, useState } from "react";

export function useLearnerTrainings(userId) {
  const [myTrainings, setMyTrainings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const unsub = onSnapshot(
      query(
        collection(db, "formations"),
        // ✅ Cette fois, userId (String) correspondra bien aux éléments du tableau
        where("participants", "array-contains", userId), 
      ),
      (snapshot) => {
        const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        setMyTrainings(docs);
        setLoading(false);
      },
      (error) => {
        console.error("Erreur Dashboard:", error);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [userId]);

  return { myTrainings, loading };
}