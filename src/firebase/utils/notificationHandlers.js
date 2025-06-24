import { doc, getDoc, writeBatch, serverTimestamp, collection, addDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";

// ...existing createUserProfile...

/**
 * Create a notification for a user (by userId or email).
 * @param {Object} notification
 * @param {string|null} notification.userId - UID of the user (null if not registered yet)
 * @param {string} notification.email - Email of the user (for invites)
 * @param {string} notification.type - Type of notification (e.g. "invite")
 * @param {string} [notification.groupId] - Optional group ID
 * @param {string} notification.message - Notification message
 */
const createNotification = async ({
    userId = null,
    email,
    type,
    groupId = null,
    message,
    link = null, // <-- add this
}) => {
    try {
        await addDoc(collection(db, "notifications"), {
            userId,
            email,
            type,
            groupId,
            message,
            link, // <-- store link
            createdAt: serverTimestamp(),
            read: false,
        });
        console.log("✅ Notification created");
    } catch (err) {
        console.error("❌ Error creating notification:", err);
    }
};
export default createNotification;