import {
    doc,
    collection,
    writeBatch,
    serverTimestamp,
    query,
    where,
    getDocs,
    arrayRemove,
    arrayUnion,
} from "firebase/firestore";
import { db } from "../firebaseConfig";

const createGroup = async ({ groupName, createdBy, members, description = "" }) => {
    if (!groupName || !createdBy || !Array.isArray(members) || members.length < 2) {
        console.error("❌ Invalid parameters passed to createGroup");
        return null;
    }

    const groupId = doc(collection(db, "groups")).id;
    const batch = writeBatch(db);

    const groupRef = doc(db, "groups", groupId);
    batch.set(groupRef, {
        groupName,
        groupId,
        createdBy,
        createdAt: serverTimestamp(),
        members,
        description,
        expenseIds: [],
    });

    // const userGroupRef = doc(db, "users", createdBy, "userGroups", groupId);
    // batch.set(userGroupRef, {
    //     groupId,
    //     groupName,
    //     joinedAt: serverTimestamp(),
    // });

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


export const replaceEmailWithUidInGroups = async (email, uid) => {
    try {
        const q = query(collection(db, "groups"), where("members", "array-contains", email));
        const snap = await getDocs(q);

        const batch = writeBatch(db);

        snap.forEach((docSnap) => {
            const groupRef = docSnap.ref;
            batch.update(groupRef, {
                members: arrayRemove(email),
            });
            batch.update(groupRef, {
                members: arrayUnion(uid),
            });
        });

        await batch.commit();
        console.log(`✅ Replaced ${email} with UID ${uid} in all groups`);
    } catch (error) {
        console.error(`❌ Failed to replace email in groups:`, error);
    }
};


export default createGroup;
