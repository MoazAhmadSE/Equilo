import { useEffect, useState } from "react";
import { doc, onSnapshot, getDoc } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";

const useUserGroups = (user) => {
    const [userGroups, setUserGroups] = useState([]);

    useEffect(() => {
        if (!user) return;

        const userRef = doc(db, "users", user.uid);

        const unsubscribe = onSnapshot(userRef, async (snap) => {
            if (!snap.exists()) {
                setUserGroups([]);
                return;
            }

            const joinedGroupIds = snap.data().joinedGroupIds || [];
            if (joinedGroupIds.length === 0) {
                setUserGroups([]);
                return;
            }

            const groupPromises = joinedGroupIds.map(async (groupId) => {
                const groupDoc = await getDoc(doc(db, "groups", groupId));
                return groupDoc.exists() ? { id: groupId, ...groupDoc.data() } : null;
            });

            const groupResults = await Promise.all(groupPromises);
            setUserGroups(groupResults.filter(Boolean));
        });

        return () => unsubscribe();
    }, [user]);

    return userGroups;
};

export default useUserGroups;
