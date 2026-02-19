'use server';

import * as admin from 'firebase-admin';

// --- Firebase Admin SDK Initialization ---
if (!admin.apps.length) {
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (!serviceAccountKey) {
        throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY is not set. This is required for admin actions.');
    }
    try {
        admin.initializeApp({
            credential: admin.credential.cert(JSON.parse(serviceAccountKey))
        });
    } catch (error) {
        console.error('Error initializing Firebase Admin SDK:', error);
        throw new Error('Could not initialize Firebase Admin SDK. Check your service account key.');
    }
}

const firestore = admin.firestore();
const auth = admin.auth();

// --- Server Actions ---

export const getUsers = async () => {
    // ... (existing code)
};

export const deleteUserAndBlockEmail = async (userId: string, email: string) => {
    try {
        // Step 1: Add the email to the blocked_emails collection
        const blockedEmailRef = firestore.collection('blocked_emails').doc(email);
        await blockedEmailRef.set({ blockedAt: new Date(), reason: 'Malpractice' });

        // Step 2: Delete the user from Firebase Authentication
        await auth.deleteUser(userId);

        // Step 3: Delete the user's data from the users collection
        await firestore.collection('users').doc(userId).delete();

        return { success: true };
    } catch (error: any) {
        console.error(`Failed to block and delete user ${userId}:`, error);
        return { success: false, error: error.message };
    }
};

export const toggleAdmin = async (userId: string, newIsAdmin: boolean) => {
    // ... (existing code)
};
