import { useEffect } from "react";
import { onAuthStateChanged, setPersistence, browserLocalPersistence } from "firebase/auth";
import { auth } from "../../firebase/firebaseConfig";

const useAuthObserver = (setUser, setLoading) => {
  useEffect(() => {
    let unsubscribe;

    setPersistence(auth, browserLocalPersistence)
      .then(() => {
        unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
          setUser(firebaseUser || null);
          setLoading(false);
        });
      })
      .catch((error) => {
        console.error("Auth persistence error:", error);
        setLoading(false);
      });

    // ✅ Cleanup
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [setUser, setLoading]);
};

export default useAuthObserver;
