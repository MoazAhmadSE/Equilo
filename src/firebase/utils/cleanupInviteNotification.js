import { doc, deleteDoc, updateDoc, arrayRemove } from "firebase/firestore";
import { db } from "../firebaseConfig";

const cleanupInviteNotification = async (notifId, userId = null) => {
    console.log("🧪 Deleting notification:", notifId, "for user:", userId);

    try {
        // Delete the notification doc
        await deleteDoc(doc(db, "notifications", notifId));
        console.log("🧹 Deleted notification:", notifId);

        // Remove reference from user document if needed
        if (userId) {
            const userRef = doc(db, "users", userId);
            await updateDoc(userRef, {
                notificationIds: arrayRemove(notifId),
            });
            console.log("✅ Removed from user's notificationIds:", notifId);
        }
    } catch (err) {
        console.error("❌ Failed to cleanup notification:", err);
    }
};

export default cleanupInviteNotification;
