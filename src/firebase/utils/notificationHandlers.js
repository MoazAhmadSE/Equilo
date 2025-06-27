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
    type = "",
    groupId = null,
    message = "",
    link = null,
}) => {

    if (!userId && !email) {
        console.warn("Skipping notification: no userId or email provided");
        return;
    }
    try {
        const notificationData = {
            ...(userId && { userId }),
            ...(email && { email }),
            type,
            groupId,
            message,
            link,
            createdAt: serverTimestamp(),
        };

        const notificationRef = await addDoc(collection(db, "notifications"), notificationData);

        console.log("✅ Notification created:", notificationRef);

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
