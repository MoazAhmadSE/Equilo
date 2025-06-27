import { useAuth } from "../context/AuthContext";
import { replaceEmailWithUidInGroups } from "../firebase/utils/groupHandlers";
import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  arrayUnion,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import createNotification from "../firebase/utils/notificationHandlers";
import cleanupInviteNotification from "../firebase/utils/cleanupInviteNotification";
import "../css/pages/JoinGroupPage.css";

const JoinGroupPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { groupId } = useParams();
  const [joining, setJoining] = useState(false);
  const [groupName, setGroupName] = useState();

  const handleAcceptInvite = async () => {
    if (!user) return;

    setJoining(true);

    try {
      await replaceEmailWithUidInGroups(user.email, user.uid);

      const groupDocRef = doc(db, "groups", groupId);
      const groupDocSnap = await getDoc(groupDocRef);

      if (!groupDocSnap.exists()) throw new Error("Group not found");

      const groupData = groupDocSnap.data();
      setGroupName(groupData.groupName);
      console.log(groupData.groupName);


      await setDoc(doc(db, "users", user.uid, "userGroups", groupId), {
        groupId,
        groupName: groupData.groupName,
        joinedAt: serverTimestamp(),
        role: "member",
      });

      await updateDoc(doc(db, "users", user.uid), {
        joinedGroupIds: arrayUnion(groupId),
      });

      await createNotification({
        userId: groupData.createdBy,
        type: "invite-accepted",
        groupId,
        message: `${user.email} has accepted your invite to join "${groupData.groupName}"!`,
      });

      await cleanupInviteNotification(user.uid, groupId);

      navigate(`/equilo/home/group/join/${groupId}`);
    } catch (err) {
      console.error("❌ Error accepting invite:", err);
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="join-group-container">
      <h2>You've been invited to join this group! {groupName}</h2>
      <button onClick={handleAcceptInvite} disabled={joining}>
        {joining ? "Joining..." : "Join Group"}
      </button>
    </div>
  );
};

export default JoinGroupPage;
