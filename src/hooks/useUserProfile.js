import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

const useUserProfile = (userId) => {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) return;

        const unsub = onSnapshot(doc(db, "users", userId), (docSnap) => {
            if (docSnap.exists()) {
                setUserData(docSnap.data());
            } else {
                setUserData(null);
            }
            setLoading(false);
        });

        return () => unsub();
    }, [userId]);

    return {
        userData,
        loading,
        isOnline: userData?.isOnline ?? false,
    };
};

export default useUserProfile;
