import { doc, getDoc, writeBatch, serverTimestamp } from "firebase/firestore";
import { db } from "../firebaseConfig";

const createUserProfile = async (user) => {
    if (!user?.uid) return;

    const userRef = doc(db, "users", user.uid);
    const snapshot = await getDoc(userRef);

    if (!snapshot.exists()) {
        const batch = writeBatch(db);
        batch.set(userRef, {
            userId: user.uid,
            userName: user.displayName || "New User",
            userEmail: user.email,
            userImage: user.photoURL || "",
            userCreatedAt: serverTimestamp(),
            isOnline: false,
        });

        try {
            await batch.commit();
            console.log("✅ User profile initialized");
        } catch (err) {
            console.error("❌ Error creating user:", err);
        }
    }
};

export default createUserProfile;