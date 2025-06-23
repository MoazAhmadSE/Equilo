import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebaseConfig";

export const sendGroupInvite = async ({ groupId, fromUserId, toUserId }) => {
  const inviteId = `${groupId}_${toUserId}`;

  const inviteRef = doc(db, "invites", inviteId);
  const invite = {
    inviteId,
    groupId,
    fromUserId,
    toUserId,
    status: "pending",
    sentAt: serverTimestamp(),
  };

  try {
    await setDoc(inviteRef, invite);
    console.log("✅ Group invite sent");
  } catch (err) {
    console.error("❌ Failed to send invite:", err);
  }
};
