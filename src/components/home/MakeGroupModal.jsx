import React, { useState } from "react";
import "../../css/components/GroupModal.css";
import { toast } from "react-toastify";
import sendGroupInviteEmail from "../../utils/sendGroupInviteEmail";
import createGroup from "../../firebase/utils/groupHandlers";
import createNotification from "../../firebase/utils/notificationHandlers";
import {
  collection,
  query,
  where,
  getDocs,
  setDoc,
  doc,
} from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";

const MakeGroupModal = ({ isOpen, onClose, user }) => {
  if (!isOpen) return null;

  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  const [members, setMembers] = useState([""]);
  const [emailErrors, setEmailErrors] = useState([]);
  const [creating, setCreating] = useState(false);

  const handleMemberChange = (index, value) => {
    const updated = [...members];
    updated[index] = value;
    setMembers(updated);

    const errors = [...emailErrors];
    errors[index] =
      value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? "Invalid email" : "";
    setEmailErrors(errors);
  };

  const handleAddMember = () => {
    setMembers([...members, ""]);
    setEmailErrors([...emailErrors, ""]);
  };

  const handleRemoveMember = (index) => {
    setMembers(members.filter((_, i) => i !== index));
    setEmailErrors(emailErrors.filter((_, i) => i !== index));
  };

  const isFormValid = () => {
    const errors = members.map((email) =>
      email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? "Invalid email" : ""
    );
    setEmailErrors(errors);
    return errors.every((err) => !err);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid()) return;
    setCreating(true);

    try {
      const memberEmails = members
        .map((email) => email.trim().toLowerCase())
        .filter((email) => email && email !== user.email.toLowerCase());
      const uniqueEmails = [...new Set(memberEmails)];

      if (uniqueEmails.length !== memberEmails.length) {
        toast.error("❌ Duplicate emails detected.");
        setCreating(false);
        return;
      }

      const groupMembers = [user.uid, ...uniqueEmails];
      const groupId = await createGroup({
        groupName: groupName.trim(),
        createdBy: user.uid,
        members: groupMembers,
        description: description.trim(),
      });

      if (!groupId) {
        toast.error("❌ Group creation failed.");
        return;
      }

      await setDoc(doc(db, "users", user.uid, "userGroups", groupId), {
        groupId,
        groupName: groupName.trim(),
        joinedAt: new Date(),
        role: "admin",
      });

      for (const email of uniqueEmails) {
        let invitedUserId = null;
        const q = query(
          collection(db, "users"),
          where("userEmail", "==", email)
        );
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

      toast.success("✅ Group created and invites sent!");
      onClose();
    } catch (err) {
      console.error("❌ Error in MakeGroupModal:", err);
      toast.error("Failed to create group.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Create New Group</h2>
        <form onSubmit={handleSubmit}>
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
              <input type="email" value={user.email} disabled />
              <span className="you-label">You</span>
            </div>

            {members.map((email, index) => (
              <div className="member-input" key={index}>
                <input
                  type="email"
                  placeholder="Member Email"
                  value={email}
                  onChange={(e) =>
                    handleMemberChange(index, e.target.value.trim())
                  }
                  required
                />
                <button
                  type="button"
                  onClick={() => handleRemoveMember(index)}
                  className="remove-btn"
                >
                  ❌
                </button>
                {emailErrors[index] && (
                  <div className="email-error">{emailErrors[index]}</div>
                )}
              </div>
            ))}

            <p className="add-more" onClick={handleAddMember}>
              ➕ Add Member
            </p>
          </div>

          <div className="modal-buttons">
            <button type="submit" className="create-btn" disabled={creating}>
              {creating ? "Creating..." : "Create Group"}
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

export default MakeGroupModal;
