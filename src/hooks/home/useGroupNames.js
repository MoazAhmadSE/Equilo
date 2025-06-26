import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";

const useGroupNames = (notifications) => {
    const [groupNames, setGroupNames] = useState({});

    useEffect(() => {
        const groupIds = notifications.filter(n => n.groupId).map(n => n.groupId);
        const unique = [...new Set(groupIds)];

        const fetchNames = async () => {
            const result = {};
            for (const id of unique) {
                const snap = await getDoc(doc(db, "groups", id));
                if (snap.exists()) result[id] = snap.data().groupName;
            }
            setGroupNames(result);
        };

        if (unique.length > 0) fetchNames();
    }, [notifications]);

    return groupNames;
};

export default useGroupNames;
