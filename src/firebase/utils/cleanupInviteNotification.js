import { doc, deleteDoc, updateDoc, arrayRemove } from "firebase/firestore";
import { db } from "../firebaseConfig";

const cleanupInviteNotification = async (notifId, userId = null) => {
    console.log("🧪 Deleting notification:", notifId, "for user:", userId);

    try {
        await deleteDoc(doc(db, "notifications", notifId));
        console.log("🧹 Deleted notification:", notifId);

        if (userId) {
            await updateDoc(doc(db, "users", userId), {
                notificationIds: arrayRemove(notifId),
            });
            console.log("✅ Removed from user's notificationIds:", notifId);
        }
    } catch (err) {
        console.error("❌ Failed to cleanup notification:", err);
    }
};

export default cleanupInviteNotification;
