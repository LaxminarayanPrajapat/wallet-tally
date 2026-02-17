'use server';

import { collection, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';

export const submitFeedback = async (feedback: string) => {
    const firestore = useFirestore();
    try {
        await addDoc(collection(firestore, 'feedback'), {
            feedback,
            createdAt: new Date(),
        });
        return { success: true };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
};

export const deleteFeedback = async (id: string) => {
    const firestore = useFirestore();
    try {
        await deleteDoc(doc(firestore, 'feedback', id));
        return { success: true };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
};
