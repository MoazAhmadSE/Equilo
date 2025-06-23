import { useEffect, useState } from "react";
import { disableNetwork, enableNetwork } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

function useFirestoreNetworkManager() {
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        const handleConnectionChange = async () => {
            try {
                setIsOnline(navigator.onLine);
                if (navigator.onLine) {
                    await enableNetwork(db);
                    console.log("You are Online");
                } else {
                    await disableNetwork(db);
                    console.log("You are Offline");
                }
            } catch (error) {
                console.error(error);
            }
        };
        handleConnectionChange();
        window.addEventListener("online", handleConnectionChange);
        window.addEventListener("offline", handleConnectionChange);

        return () => {
            window.removeEventListener("online", handleConnectionChange);
            window.removeEventListener("offline", handleConnectionChange);
        };
    }, []);

    return isOnline;
}
export default useFirestoreNetworkManager;