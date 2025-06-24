import {
    doc,
    updateDoc,
    addDoc,
    arrayUnion,
    serverTimestamp,
    collection,
} from "firebase/firestore";
import { db } from "../firebaseConfig";

const createNotification = async ({
    userId = null,
    email = null,
    type,
    groupId = null,
    message,
    link = null,
}) => {
    
    try {
        // Build notification object conditionally
        const notificationData = {
            ...(userId && { userId }),
            ...(email && { email }),
            type,
            groupId,
            message,
            link,
            createdAt: serverTimestamp(),
            read: false,
        };

        const notificationRef = await addDoc(collection(db, "notifications"), notificationData);

        console.log("✅ Notification created:", notificationRef.id);

        // Optional: Add notification ID to user profile (only if userId is provided)
        if (userId) {
            await updateDoc(doc(db, "users", userId), {
                notificationIds: arrayUnion(notificationRef.id),
            });
        }

        return notificationRef;
    } catch (err) {
        console.error("❌ Error creating notification:", err);
    }
};

export default createNotification;
