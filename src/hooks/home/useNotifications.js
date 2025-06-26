import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";

const useNotifications = (user) => {
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        if (!user) return;

        const q1 = query(collection(db, "notifications"), where("userId", "==", user.uid));
        const q2 = query(collection(db, "notifications"), where("email", "==", user.email));

        const buffers = { userId: [], email: [] };

        const merge = () => {
            const merged = new Map();
            [...buffers.userId, ...buffers.email].forEach((doc) => {
                merged.set(doc.id, { id: doc.id, ...doc.data() });
            });
            setNotifications(Array.from(merged.values()));
        };

        const unsub1 = onSnapshot(q1, (snap) => {
            buffers.userId = snap.docs;
            merge();
        });

        const unsub2 = onSnapshot(q2, (snap) => {
            buffers.email = snap.docs;
            merge();
        });

        return () => {
            unsub1();
            unsub2();
        };
    }, [user]);

    return notifications;
};

export default useNotifications;