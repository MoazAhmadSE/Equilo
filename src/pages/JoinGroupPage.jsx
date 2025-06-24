import { useAuth } from "../context/AuthContext";
import { replaceEmailWithUidInGroups } from "../firebase/utils/groupHandlers";
import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import { doc, setDoc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import createNotification from "../firebase/utils/notificationHandlers";
import cleanupInviteNotification from "../firebase/utils/cleanupInviteNotification";

const JoinGroupPage = () => {
  const { user } = useAuth();
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [joining, setJoining] = useState(false);

  const handleAcceptInvite = async () => {
    if (!user) return;
    setJoining(true);

    try {
      // 1. Replace email in group doc
      await replaceEmailWithUidInGroups(user.email, user.uid);

      // 2. Get group details
      const groupDocRef = doc(db, "groups", groupId);
      const groupDocSnap = await getDoc(groupDocRef);

      if (!groupDocSnap.exists()) throw new Error("Group not found");

      const groupData = groupDocSnap.data();

      // 3. Add group to user subcollection
      await setDoc(doc(db, "users", user.uid, "userGroups", groupId), {
        groupId,
        groupName: groupData.groupName,
        joinedAt: new Date(),
        role: "member",
      });

      // 4. Add group ID to main user document
      await updateDoc(doc(db, "users", user.uid), {
        joinedGroupIds: arrayUnion(groupId),
      });

      // 5. Notify group admin
      await createNotification({
        userId: groupData.createdBy, // admin only
        type: "invite-accepted",
        groupId,
        message: `${user.email} has accepted your invite to join "${groupData.groupName}"!`,
        link: `/equilo/home/group/join/${groupId}`,
      });

      // 6. Clean up old invite notification
      await cleanupInviteNotification(user.uid, groupId, user.email);

      // ✅ Redirect
      navigate(`/equilo/home`);
    } catch (err) {
      console.error("❌ Error accepting invite:", err);
    } finally {
      setJoining(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>You've been invited to join this group!</h2>
      <button onClick={handleAcceptInvite} disabled={joining}>
        {joining ? "Joining..." : "Join Group"}
      </button>
    </div>
  );
};

export default JoinGroupPage;
