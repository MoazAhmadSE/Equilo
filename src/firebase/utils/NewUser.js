import { doc, getDoc, writeBatch, serverTimestamp } from "firebase/firestore";
import { db } from "../firebaseConfig";

const NewUser = async (user) => {
    if (!user || !user.uid) return;

    const userDocRef = doc(db, "users", user.uid);
    const existingUser = await getDoc(userDocRef);

    if (!existingUser.exists()) {
        const batch = writeBatch(db);

        batch.set(userDocRef, {
            userId: user.uid,
            userName: user.displayName || "New User",
            userEmail: user.email,
            userImage: user.photoURL || "",
            userCreatedAt: serverTimestamp(),
            isOnline: false,
        });

        // const taskDocRef = doc(db, "tasks", user.uid);
        // batch.set(taskDocRef, {
        //     todo: [],
        //     completed: [],
        // });

        try {
            await batch.commit();
            console.log("✅ User & tasks initialized successfully.");
        } catch (error) {
            console.error("❌ Error creating user or tasks:", error);
        }
    } else {
        console.log("ℹ️ User already exists, skipping creation.");
    }
};

export default NewUser;
