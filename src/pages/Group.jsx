import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { useAuth } from "../context/AuthContext";
import "../css/pages/Group.css";
import EditGroupModal from "../components/EditGroupModal";
import deleteGroup from "../firebase/utils/deleteGroup";
import AddExpenseModal from "../components/AddExpenseModal";

const Group = () => {
  const { groupId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [groupData, setGroupData] = useState(null);
  const [creatorName, setCreatorName] = useState("Loading...");
  const [resolvedMembers, setResolvedMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [expenseOpen, setExpenseOpen] = useState(false);

  const handleAddExpense = (expense) => {
    console.log("Add expense:", expense);
    // TODO: Add expense to Firestore here
  };

  const fetchGroup = async () => {
    try {
      const groupRef = doc(db, "groups", groupId);
      const groupSnap = await getDoc(groupRef);
      if (!groupSnap.exists()) {
        navigate("/equilo/home", { replace: true });
        return;
      }

      const group = groupSnap.data();
      setGroupData(group);

      if (
        !group.members ||
        (!group.members.includes(user.uid) &&
          !group.members.includes(user.email))
      ) {
        navigate("/equilo/home", { replace: true });
        return;
      }

      const creatorRef = doc(db, "users", group.createdBy);
      const creatorSnap = await getDoc(creatorRef);
      setCreatorName(
        creatorSnap.exists() ? creatorSnap.data().userName : group.createdBy
      );

      const members = group.members || [];
      const uids = members.filter((m) => !m.includes("@"));
      const emails = members.filter((m) => m.includes("@"));

      const usersQuery = query(
        collection(db, "users"),
        where("userId", "in", uids)
      );
      const userSnaps = await getDocs(usersQuery);

      const resolved = [];
      userSnaps.docs.forEach((docSnap) => {
        const data = docSnap.data();
        resolved.push({
          id: data.userId,
          name: data.userName,
          email: data.userEmail,
          isAdmin: data.userId === group.createdBy,
          isJoined: true,
        });
      });

      emails.forEach((email) => {
        resolved.push({
          id: email,
          name: email,
          email: email,
          isAdmin: false,
          isJoined: false,
        });
      });

      resolved.sort((a, b) => (b.isAdmin ? 1 : 0) - (a.isAdmin ? 1 : 0));
      setResolvedMembers(resolved);
    } catch (err) {
      console.error("Failed to fetch group:", err);
      navigate("/equilo/home", { replace: true });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroup();
    // eslint-disable-next-line
  }, [groupId]);

  const handleDeleteGroup = () => {
    deleteGroup({
      groupId,
      groupData,
      members: groupData.members,
      user,
      onClose: () => setEditOpen(false),
      onRefresh: () => navigate("/equilo/home"),
    });
  };

  if (loading) return <div className="group-loader">Loading group info...</div>;
  if (!groupData) return <div className="group-error">Group not found.</div>;

  return (
    <div className="group-page">
      <h2 className="group-title">{groupData.groupName}</h2>
      <p className="group-desc">{groupData.description || "No description."}</p>
      <p className="group-subtext">
        Created by: <strong>{creatorName}</strong>
      </p>
      <p className="group-subtext">
        Created at:{" "}
        {groupData.createdAt?.toDate().toLocaleString("en-GB", {
          dateStyle: "long",
          timeStyle: "short",
        })}
      </p>

      <div className="group-members">
        <h3 className="group-members-heading">Members</h3>
        <ul className="member-list">
          {resolvedMembers.map((m) => (
            <li
              key={m.id}
              className={`member-item ${!m.isJoined ? "blurred" : ""}`}
            >
              <span className="member-name">{m.name}</span>
              <span className="member-email">({m.email})</span>
              {m.isAdmin && <span className="admin-badge">Admin</span>}
            </li>
          ))}
        </ul>
      </div>

      {user?.uid === groupData.createdBy && (
        <div className="group-actions mt-4">
          <button className="btn-delete" onClick={handleDeleteGroup}>
            🗑️ Delete Group
          </button>
          <button className="btn-add" onClick={() => setEditOpen(true)}>
            ✏️ Edit Group
          </button>
          <button
            className="btn-add-expense"
            onClick={() => setExpenseOpen(true)}
          >
            ➕ Add Expense
          </button>
        </div>
      )}

      {editOpen && (
        <EditGroupModal
          groupId={groupId}
          groupData={groupData}
          isOpen={editOpen}
          onClose={() => setEditOpen(false)}
          onRefresh={fetchGroup}
        />
      )}

      <AddExpenseModal
        isOpen={expenseOpen}
        onClose={() => setExpenseOpen(false)}
        groupId={groupId}
        onAdd={handleAddExpense}
      />
    </div>
  );
};

export default Group;
