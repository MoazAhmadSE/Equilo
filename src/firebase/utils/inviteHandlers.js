import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebaseConfig";

export const sendGroupInvite = async ({ groupId, fromUserId, toEmail, toUserId = null }) => {
  const inviteId = `${groupId}_${toEmail}`; // Use email for unique ID

  const inviteRef = doc(db, "invites", inviteId);
  const invite = {
    inviteId,
    groupId,
    fromUserId,
    toUserId, // null if user doesn't exist yet
    toEmail,  // always store the email
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
