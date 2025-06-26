import { collection, query, where, getDocs, updateDoc, doc, arrayUnion } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

const updateNotificationsWithUid = async (email, uid) => {
    const notiQuery = query(
        collection(db, "notifications"),
        where("email", "==", email),
        where("userId", "==", null)
    );
    const notiSnap = await getDocs(notiQuery);
    const userRef = doc(db, "users", uid);

    for (const docSnap of notiSnap.docs) {
        await updateDoc(docSnap.ref, { userId: uid });
        await updateDoc(userRef, {
            notificationIds: arrayUnion(docSnap.id),
        });
    }
};

export default updateNotificationsWithUid;