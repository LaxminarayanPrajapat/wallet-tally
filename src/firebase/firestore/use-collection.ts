'use client';
import { useState, useEffect } from 'react';
import { onSnapshot, query, Query, collection, DocumentData } from 'firebase/firestore';

interface DocumentWithId extends DocumentData {
  id: string;
}

export function useCollection<T extends DocumentData>(q: Query<T> | null) {
  const [data, setData] = useState<T[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!q) {
      setData([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const documents = snapshot.docs.map((doc) => ({
          ...(doc.data() as T),
          id: doc.id,
        }));
        setData(documents);
        setIsLoading(false);
      },
      (err) => {
        setError(err);
        setIsLoading(false);
        console.error("Error fetching collection:", err);
      }
    );

    return () => unsubscribe();
  }, [q]);

  return { data, isLoading, error };
}
