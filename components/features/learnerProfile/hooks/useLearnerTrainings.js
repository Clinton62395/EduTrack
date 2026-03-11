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
        where("participants", "array-contains", userId),
      ),
      (snapshot) => {
        setMyTrainings(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
    );

    return () => unsub();
  }, [userId]);

  return { myTrainings, loading };
}
