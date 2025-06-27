import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";

const useNotifications = (user) => {
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        if (!user) return;

        const q = query(
            collection(db, "notifications"),
            where("userId", "==", user.uid)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const notis = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            console.log(snapshot.docs);
            notis.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds);
            setNotifications(notis);
        });

        return () => unsubscribe();
    }, [user]);

    return notifications;
};

export default useNotifications;
