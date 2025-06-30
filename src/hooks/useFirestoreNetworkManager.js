import { useEffect, useState } from "react";
import { disableNetwork, enableNetwork } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { toast } from "react-toastify";

function useFirestoreNetworkManager() {
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    const handleConnectionChange = async () => {
        setIsOnline(navigator.onLine);
        if (navigator.onLine) {
            console.log("[+] Enabling Firestore network");
            try {
                await enableNetwork(db);
            } catch (err) {
                console.error("Enable network failed", err);
            }
        } else {
            console.log("[-] Disabling Firestore network");
            toast.error("You are Offline.");
            try {
                await disableNetwork(db);
            } catch (err) {
                console.error("Disable network failed", err);
            }
        }
    };
    useEffect(() => {

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