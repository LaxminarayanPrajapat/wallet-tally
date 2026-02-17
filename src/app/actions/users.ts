'use server';

import { collection, getDocs, doc, deleteDoc, updateDoc, getDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';

export const getUsers = async () => {
    const firestore = useFirestore();
    try {
        const usersCollection = collection(firestore, 'users');
        const userSnapshot = await getDocs(usersCollection);
        const userList = userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return { success: true, data: userList };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
};

export const deleteUser = async (userId: string) => {
    const firestore = useFirestore();
    try {
        await deleteDoc(doc(firestore, 'users', userId));
        return { success: true };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
};

export const toggleAdmin = async (userId: string) => {
    const firestore = useFirestore();
    try {
        const userRef = doc(firestore, 'users', userId);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
            throw new Error("User not found");
        }
        const currentIsAdmin = userSnap.data().isAdmin || false;
        await updateDoc(userRef, { isAdmin: !currentIsAdmin });
        return { success: true, isAdmin: !currentIsAdmin };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
};
