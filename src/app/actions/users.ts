'use server';

import * as admin from 'firebase-admin';

// --- Firebase Admin SDK Initialization ---
// This ensures the SDK is initialized only once.

// Function to parse the service account key from an environment variable
const getServiceAccount = () => {
    try {
        const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
        if (!serviceAccountKey) {
            console.log("FIREBASE_SERVICE_ACCOUNT_KEY env var not found. Falling back to application default credentials.");
            return null;
        }
        return JSON.parse(serviceAccountKey);
    } catch (e) {
        console.error('Error parsing FIREBASE_SERVICE_ACCOUNT_KEY:', e);
        return null; // Return null if parsing fails
    }
};

if (!admin.apps.length) {
    const serviceAccount = getServiceAccount();
    if (serviceAccount) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
    } else {
        // This will use GOOGLE_APPLICATION_CREDENTIALS environment variable on a server,
        // or default credentials on a local machine.
        admin.initializeApp({
            credential: admin.credential.applicationDefault()
        });
    }
}

const firestore = admin.firestore();
const auth = admin.auth();

// --- Server Actions ---

export const getUsers = async () => {
    try {
        const usersSnapshot = await firestore.collection('users').orderBy('displayName').get();
        const userList = usersSnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
        return { success: true, data: userList };
    } catch (error: any) {
        console.error("Error in getUsers server action:", error);
        return { success: false, error: error.message };
    }
};

export const deleteUser = async (userId: string) => {
    try {
        // Step 1: Delete user from Firebase Authentication. This is the crucial step.
        await auth.deleteUser(userId);

        // Step 2: Delete user data from Firestore database.
        await firestore.collection('users').doc(userId).delete();
        
        console.log(`Successfully deleted user ${userId} from Auth and Firestore.`);
        return { success: true };
    } catch (error: any) {
        console.error(`Failed to delete user ${userId}:`, error);
        // Provide a more specific error message if possible
        if (error.code === 'auth/user-not-found') {
             return { success: false, error: 'User not found in Firebase Authentication. They may have already been deleted.' };
        }
        return { success: false, error: error.message };
    }
};

// The client-side code calls `toggleAdmin(uid, !isAdmin)`.
// So the second argument is the *new* desired state.
export const toggleAdmin = async (userId: string, newIsAdmin: boolean) => {
    try {
        // Step 1: Set a custom claim on the user's auth token for security roles.
        await auth.setCustomUserClaims(userId, { admin: newIsAdmin });

        // Step 2: Update the isAdmin field in the Firestore document.
        await firestore.collection('users').doc(userId).update({ isAdmin: newIsAdmin });

        console.log(`Successfully set admin status for ${userId} to ${newIsAdmin}.`);
        return { success: true, isAdmin: newIsAdmin };
    } catch (error: any) {
        console.error(`Failed to toggle admin for user ${userId}:`, error);
        return { success: false, error: error.message };
    }
};
