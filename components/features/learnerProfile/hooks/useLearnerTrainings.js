// hooks/useLearnerTrainings.js
import { db } from "@/components/lib/firebase";
import { useEffect, useState } from "react"; // firestore via db methods

export function useLearnerTrainings(userId) {
  const [myTrainings, setMyTrainings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    // On cherche les formations où l'ID de l'utilisateur est dans le tableau "participants"
    const q = db
      .collection("formations")
      .where("participants", "array-contains", userId);

    const unsub = q.onSnapshot((snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMyTrainings(data);
      setLoading(false);
    });

    return unsub;
  }, [userId]);

  return { myTrainings, loading };
}
