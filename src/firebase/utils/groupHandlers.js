import {
    doc,
    collection,
    writeBatch,
    serverTimestamp,
    query,
    where,
    getDocs,
    // updateDoc,
    arrayRemove,
    arrayUnion,
} from "firebase/firestore";
import { db } from "../firebaseConfig";

/**
 * Creates a new group with members and links it to the creator user.
 * @param {Object} param
 * @param {string} param.groupName - Name of the group
 * @param {string} param.createdBy - UID of user creating the group
 * @param {Array<string>} param.members - Array of user IDs/emails in the group
 * @param {string} [param.description] - Optional description of the group
 * @returns {string|null} The new group ID or null if failed
 */
const createGroup = async ({ groupName, createdBy, members, description = "" }) => {
    if (!groupName || !createdBy || !Array.isArray(members) || members.length === 0) {
        console.error("❌ Invalid parameters passed to createGroup");
        return null;
    }

    const groupId = doc(collection(db, "groups")).id;
    const batch = writeBatch(db);

    const groupRef = doc(db, "groups", groupId);
    batch.set(groupRef, {
        groupId,
        groupName,
        createdBy,
        createdAt: serverTimestamp(),
        members,
        description,
        expenseIds: [],
    });

    const userGroupRef = doc(db, "users", createdBy, "userGroups", groupId);
    batch.set(userGroupRef, {
        groupId,
        groupName,
        joinedAt: serverTimestamp(),
    });

    batch.update(doc(db, "users", createdBy), {
        joinedGroupIds: arrayUnion(groupId),
    });

    try {
        await batch.commit();
        console.log("✅ Group created successfully with members:", members);
        return groupId;
    } catch (error) {
        console.error("❌ Error creating group:", error);
        return null;
    }
};

/**
 * Replace email with UID in all groups where that email exists as a member.
 * @param {string} email - Email to replace
 * @param {string} uid - User ID to replace email with
 */
export const replaceEmailWithUidInGroups = async (email, uid) => {
    try {
        const groupsRef = collection(db, "groups");
        const q = query(groupsRef, where("members", "array-contains", email));
        const snap = await getDocs(q);

        const batch = writeBatch(db);
        snap.docs.forEach((docSnap) => {
            const groupRef = docSnap.ref;
            batch.update(groupRef, {
                members: arrayRemove(email),
            });
            batch.update(groupRef, {
                members: arrayUnion(uid),
            });
        });

        await batch.commit();
        console.log(`✅ Replaced email ${email} with UID ${uid} in all groups`);
    } catch (error) {
        console.error(`❌ Failed to replace email in groups:`, error);
    }
};

export default createGroup;
