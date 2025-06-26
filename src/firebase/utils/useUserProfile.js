import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { useAuth } from "../../context/AuthContext";

const useUserProfile = () => {
    const { user } = useAuth();
    const [userData, setUserData] = useState();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!user || !user.uid) {
            setUserData(undefined);
            setLoading(false);
            return;
        }

        setLoading(true);

        const unsub = onSnapshot(doc(db, "users", user.uid), (docSnap) => {
            if (docSnap.exists()) {
                setUserData(docSnap.data());
            } else {
                setUserData(null);
            }
            setLoading(false);
        });

        return () => unsub();
    }, [user]);


    return {
        userData,
        loading,
        isOnline: userData?.isOnline ?? false,
    };
};

export default useUserProfile;
