// src/services/deleteGroup.js
import {
    doc,
    writeBatch,
    getDocs,
    query,
    collection,
    where,
    arrayRemove,
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import { toast } from "react-toastify";
import { sendGroupDeletionEmail } from "../../utils/sendGroupDeletionNotifications";

const deleteGroup = async ({
    groupId,
    groupData,
    members,
    user,
    onClose,
    onRefresh,
}) => {
    const confirm = window.confirm("Are you sure you want to delete this group?");
    if (!confirm) return;

    try {
        const batch = writeBatch(db);

        // Remove groupId from all users
        const userQuery = query(
            collection(db, "users"),
            where("groupIds", "array-contains", groupId)
        );
        const userSnap = await getDocs(userQuery);
        userSnap.forEach((userDoc) => {
            batch.update(userDoc.ref, {
                groupIds: arrayRemove(groupId),
            });
        });

        // Delete related notifications
        const notifQuery = query(
            collection(db, "notifications"),
            where("groupId", "==", groupId)
        );
        const notifSnap = await getDocs(notifQuery);
        notifSnap.forEach((notifDoc) => {
            batch.delete(notifDoc.ref);
        });

        // Send deletion email to members
        for (const member of members) {
            if (typeof member === "string" && member.includes("@")) {
                await sendGroupDeletionEmail({
                    to_email: member,
                    group_name: groupData.groupName,
                    deleter: user.displayName || user.email,
                });
            }
        }

        // Delete the group document
        batch.delete(doc(db, "groups", groupId));

        await batch.commit();
        toast.success("✅ Group deleted successfully");

        if (onClose) onClose();
        if (onRefresh) onRefresh();
    } catch (err) {
        console.error("❌ Failed to delete group:", err);
        toast.error("❌ Failed to delete group");
    }
};
export default deleteGroup;