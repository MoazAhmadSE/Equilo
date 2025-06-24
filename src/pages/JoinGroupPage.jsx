import { useAuth } from "../context/AuthContext";
import { replaceEmailWithUidInGroups } from "../firebase/utils/groupHandlers";
import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import createNotification from "../firebase/utils/notificationHandlers";

const JoinGroupPage = () => {
  const { user } = useAuth();
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [joining, setJoining] = useState(false);

  const handleAcceptInvite = async () => {
    if (!user) return;
    setJoining(true);
    try {
      // Replace email with UID in the group
      await replaceEmailWithUidInGroups(user.email, user.uid);

      // Add group reference to user's userGroups subcollection
      const groupDoc = await getDoc(doc(db, "groups", groupId));
      if (groupDoc.exists()) {
        const groupData = groupDoc.data();
        await setDoc(
          doc(db, "users", user.uid, "userGroups", groupId),
          {
            groupId,
            groupName: groupData.groupName,
            joinedAt: new Date(),
            role: "member",
          }
        );
        // Notify the group admin that this user accepted the invite
        await createNotification({
          userId: groupData.createdBy, // admin's UID
          email: "", // not needed for admin
          type: "invite-accepted",
          groupId,
          message: `${user.email} has accepted your invite to join "${groupData.groupName}"!`,
          link: `/equilo/home/group/join/${groupId}`,
        });
      }

      // Redirect to group page or dashboard
      navigate(`/equilo/home`);
    } catch (err) {
      // Handle error (show toast, etc)
      console.error("Error accepting invite:", err);
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