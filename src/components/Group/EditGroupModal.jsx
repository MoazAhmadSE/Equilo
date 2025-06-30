// EditGroupModal.js

import React, { useState, useEffect } from "react";
import "../../css/components/GroupModal.css";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import deleteGroup from "../../firebase/utils/deleteGroup";
import sendGroupInviteEmail from "../../utils/sendGroupInviteEmail";
import createNotification from "../../firebase/utils/notificationHandlers";
import { sendMemberRemovalEmail } from "../../utils/sendGroupDeletionNotifications";
import {
  doc,
  updateDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";

const EditGroupModal = ({ isOpen, onClose, groupData, groupId, onRefresh }) => {
  const { user } = useAuth();
  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  const [members, setMembers] = useState([]);
  const [memberDetails, setMemberDetails] = useState({});

  async function initValues() {
    if (isOpen && groupData) {
      setGroupName(groupData.groupName);
      setDescription(groupData.description || "");

      const rawMembers = groupData.members || [];
      const nonAdminMembers = rawMembers.filter((id) => id !== user.uid);
      setMembers(nonAdminMembers);

      const allMembers = [user.uid, ...nonAdminMembers];
      const details = {};

      await Promise.all(
        allMembers.map(async (uid) => {
          const userDoc = await getDoc(doc(db, "users", uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            details[uid] = {
              name:
                data.userName ||
                data.displayName ||
                data.userEmail ||
                "Unknown",
              email: data.userEmail || "unknown@email.com",
            };
          } else {
            details[uid] = { name: "Unregistered", email: "" };
          }
        })
      );

      setMemberDetails(details);
    }
  }
  useEffect(() => {
    initValues();
  }, [isOpen, groupData]);


  const handleAddMember = () => {
    setMembers([...members, ""]);
  };

  const handleRemoveMember = (index) => {
    if (members.length <= 1) {
      toast.warn("⚠️ A group must have at least two members.");
      return;
    }
    const updated = members.filter((_, i) => i !== index);
    setMembers(updated);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const filtered = members.filter((id) => id);
      const prevMembers = groupData.members || [];

      const removedEmails = prevMembers.filter(
        (m) => m.includes("@") && !filtered.includes(m)
      );

      for (const email of removedEmails) {
        await sendMemberRemovalEmail({
          to_email: email,
          group_name: groupName,
          deleter: user.displayName || user.email,
        });
      }

      const prevEmails = prevMembers.filter((m) => m.includes("@"));
      const newEmails = filtered.filter(
        (m) => m.includes("@") && !prevEmails.includes(m)
      );

      for (const email of newEmails) {
        let invitedUserId = null;
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("userEmail", "==", email));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          invitedUserId = querySnapshot.docs[0].id;
        }

        await sendGroupInviteEmail({
          to_email: email,
          inviter: user.displayName || user.email,
          group_name: groupName,
          invite_link: `http://localhost:5173/equilo/home/group/join/${groupId}`,
        });

        await createNotification({
          userId: invitedUserId,
          email,
          type: "invite",
          groupId,
          message: `You've been invited to join the group "${groupName}"!`,
          link: `/equilo/home/group/join/${groupId}`,
        });
      }

      await updateDoc(doc(db, "groups", groupId), {
        groupName: groupName.trim(),
        description: description.trim(),
        members: [user.uid, ...filtered],
      });

      toast.success("✅ Group updated successfully");
      onClose();
      onRefresh();
    } catch (err) {
      console.error("Failed to update group:", err);
      toast.error("❌ Error updating group");
    }
  };

  if (!isOpen || !groupData) return null;
  if (user.uid !== groupData.createdBy) {
    toast.error("❌ Only the group admin can edit the group.");
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Edit Group</h2>
        <form onSubmit={handleUpdate}>
          <input
            type="text"
            placeholder="Group Name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            required
          />
          <textarea
            placeholder="Group Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />

          <div className="member-section">
            <label>Group Members:</label>
            <div className="member-input">
              <input
                type="text"
                value={`${memberDetails[user.uid]?.name || user.uid} (${
                  memberDetails[user.uid]?.email || user.email
                })`}
                disabled
              />
              <span className="you-label">Admin</span>
            </div>

            {members.map((uid, index) => (
              <div className="member-input" key={index}>
                <input
                  type="text"
                  value={
                    uid && !uid.includes("@") && memberDetails[uid]
                      ? `${memberDetails[uid].name} (${memberDetails[uid].email})`
                      : uid
                  }
                  onChange={(e) => {
                    const updated = [...members];
                    updated[index] = e.target.value;
                    setMembers(updated);
                  }}
                />
                <button
                  type="button"
                  onClick={() => handleRemoveMember(index)}
                  className="remove-btn"
                >
                  ❌
                </button>
              </div>
            ))}

            <p className="add-more" onClick={handleAddMember}>
              ➕ Add Member
            </p>
          </div>

          <div className="modal-buttons">
            <button type="submit" className="create-btn">
              Save Changes
            </button>
            <button type="button" onClick={onClose} className="cancel-btn">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditGroupModal;
