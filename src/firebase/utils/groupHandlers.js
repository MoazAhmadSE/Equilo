import {
    doc,
    collection,
    writeBatch,
    serverTimestamp,
    query,
    where,
    getDocs,
    updateDoc,
    arrayRemove,
    arrayUnion,
} from "firebase/firestore";
import { db } from "../firebaseConfig";

const createGroup = async ({ groupName, createdBy, members }) => {
    console.log("Creating group with params:", {
        groupName,
        createdBy,
        members,
    });
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
    });

    // ✅ Only add reference for the current user (createdBy)
    const userGroupRef = doc(db, "users", createdBy, "userGroups", groupId);
    batch.set(userGroupRef, {
        groupId,
        groupName,
        joinedAt: serverTimestamp(),
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

export const replaceEmailWithUidInGroups = async (email, uid) => {
    const groupsRef = collection(db, "groups");
    const q = query(groupsRef, where("members", "array-contains", email));
    const snap = await getDocs(q);

    for (const docSnap of snap.docs) {
        const groupRef = docSnap.ref;
        await updateDoc(groupRef, {
            members: arrayRemove(email),
        });
        await updateDoc(groupRef, {
            members: arrayUnion(uid),
        });
    }
};

export default createGroup;