import "../../css/components/GroupModal.css";
import React, { useState } from "react";
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
import SVGIcons from "../../assets/icons/SVGIcons";

const MakeGroupModal = ({ handleCreateGroupModal, user }) => {
  const [formData, setFormData] = useState({
    groupName: "",
    description: "",
    members: [""],
    emailErrors: [],
  });

  const [creating, setCreating] = useState(false);

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleMemberChange = (index, value) => {
    const updated = [...formData.members];
    updated[index] = value;

    // const errors = [...formData.emailErrors];
    // errors[index] =
    //   value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? "Invalid email" : "";

    setFormData((prev) => ({
      ...prev,
      members: updated,
      // emailErrors: errors,
    }));
  };

  const handleAddMember = () => {
    setFormData((prev) => ({
      ...prev,
      members: [...prev.members, ""],
      emailErrors: [...prev.emailErrors, ""],
    }));
  };

  const handleRemoveMember = (index) => {
    setFormData((prev) => ({
      ...prev,
      members: prev.members.filter((_, i) => i !== index),
      emailErrors: prev.emailErrors.filter((_, i) => i !== index),
    }));
  };

  const isFormValid = () => {
    const userEmail = user.email.toLowerCase();
    const seen = new Set();
    const errors = formData.members.map((rawEmail) => {
      const email = rawEmail.trim().toLowerCase();

      if (!email) return "";

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return "Invalid email format";
      }

      if (email === userEmail) {
        return "You cannot add yourself";
      }

      if (seen.has(email)) {
        return "Duplicate email";
      }

      seen.add(email);
      return "";
    });

    setFormData((prev) => ({
      ...prev,
      emailErrors: errors,
    }));

    return errors.every((err) => err === "");
  };

  const handleSubmit = async () => {
    const uniqueEmails = isFormValid();
    if (!uniqueEmails) return;
    setCreating(true);
    console.log("👀 Group Name Entered:", formData.groupName);
    console.log("🧠 Trimmed Group Name:", formData.groupName.trim());

    console.log(uniqueEmails);
    console.log(formData.members);
    try {
      const groupMembers = [user.uid, ...formData.members];
      const groupId = await createGroup({
        groupName: formData.groupName.trim(),
        createdBy: user.uid,
        members: groupMembers,
        description: formData.description.trim(),
      });

      if (!groupId) {
        toast.error("❌ Group creation failed.");
        return;
      }

      // await setDoc(doc(db, "users", user.uid, "userGroups", groupId), {
      //   groupId,
      //   groupName: formData.groupName.trim(),
      //   joinedAt: new Date(),
      //   role: "admin",
      // });

      for (const email of formData.members) {
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
          group_name: formData.groupName,
          invite_link: `http://localhost:5173/equilo/home/group/join/${groupId}`,
        });

        await createNotification({
          userId: invitedUserId,
          email,
          type: "invite",
          groupId,
          message: `You've been invited to join the group "${formData.groupName}"!`,
          link: `/equilo/home/group/join/${groupId}`,
        });
      }

      toast.success("✅ Group created and invites sent!");
      handleCreateGroupModal();
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
        <div>
          <input
            type="text"
            placeholder="Group Name"
            value={formData.groupName}
            onChange={(e) => handleFieldChange("groupName", e.target.value)}
            required
          />
          <textarea
            placeholder="Group Description (optional)"
            value={formData.description}
            onChange={(e) => handleFieldChange("description", e.target.value)}
            rows={3}
          />

          <div className="member-section">
            <label>Group Members:</label>
            <div className="email-input">
              <input type="email" value={user.email} disabled />
              <span className="you-label">You</span>
            </div>
            {formData.members.map((email, index) => (
              <div className="member-input" key={index}>
                <div className="email-input">
                  <input
                    type="email"
                    placeholder="Member Email"
                    value={email}
                    onChange={(e) =>
                      handleMemberChange(
                        index,
                        e.target.value.replace(/\s/g, "").toLowerCase()
                      )
                    }
                    className={
                      formData.emailErrors[index] === "Duplicate email"
                        ? "duplicate-border"
                        : ""
                    }
                    required
                  />
                  <SVGIcons.closeCross
                    fill="red"
                    className="remove-btn"
                    onClick={() => handleRemoveMember(index)}
                  />
                </div>
                {formData.emailErrors[index] && (
                  <div className="email-error">
                    {formData.emailErrors[index]}
                  </div>
                )}
              </div>
            ))}
            <p className="add-more" onClick={handleAddMember}>
              <SVGIcons.plus />
              Add Member
            </p>
          </div>

          <div className="modal-buttons">
            <button
              type="button"
              className="create-btn"
              onClick={handleSubmit}
              disabled={creating}
            >
              {creating ? "Creating..." : "Create Group"}
            </button>
            <button
              type="button"
              onClick={handleCreateGroupModal}
              className="cancel-btn"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MakeGroupModal;
