import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { useAuth } from "../context/AuthContext";

const useUserProfile = () => {
    const { user } = useAuth();
    const [userData, setUserData] = useState();
    const [loading, setLoading] = useState(false);
    console.log("user", user, user?.uid);

    useEffect(() => {
        if (!user || !user.uid) {
            setUserData(undefined);
            setLoading(false);
            return;
        }

        setLoading(true); // only set when we have a valid user

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
