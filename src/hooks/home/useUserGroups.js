import { useEffect, useState } from "react";
import { collection, doc, getDoc, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";

const useUserGroups = (user) => {
    const [userGroups, setUserGroups] = useState([]);

    useEffect(() => {
        if (!user) return;
        const ref = collection(db, "users", user.uid, "userGroups");

        const unsub = onSnapshot(ref, async (snap) => {
            const groups = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            const valid = [];
            for (const group of groups) {
                const gRef = doc(db, "groups", group.groupId);
                const gSnap = await getDoc(gRef);
                if (gSnap.exists()) {
                    valid.push({ ...group, groupName: gSnap.data().groupName || group.groupName });
                }
            }
            setUserGroups(valid);
        });

        return () => unsub();
    }, [user]);

    return userGroups;
};

export default useUserGroups;