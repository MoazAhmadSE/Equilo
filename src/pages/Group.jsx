import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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

import EditGroupModal from "../components/EditGroupModal";
import AddExpenseModal from "../components/AddExpenseModal";
import ExpenseDetailsModal from "../components/ExpenseDetailsModal";
import deleteGroup from "../firebase/utils/deleteGroup";
import GroupDebtsBreakdown from "../components/GroupDebtsBreakdown";

import "../css/pages/Group.css";
import UserGroupExpenseCharts from "../components/GroupPieChart";

const Group = () => {
  const { groupId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [groupData, setGroupData] = useState(null);
  const [creatorName, setCreatorName] = useState("Loading...");
  const [resolvedMembers, setResolvedMembers] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [expenseOpen, setExpenseOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);

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
      console.log("🎯 Group data loaded:", group);

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

      const uids = group.members.filter((m) => !m.includes("@"));
      const emails = group.members.filter((m) => m.includes("@"));

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

      if (group.expenseIds && group.expenseIds.length > 0) {
        const expensePromises = group.expenseIds.map((id) =>
          getDoc(doc(db, "expenses", id))
        );
        const expenseSnaps = await Promise.all(expensePromises);

        const expensesData = expenseSnaps
          .filter((snap) => snap.exists())
          .map((snap) => ({ id: snap.id, ...snap.data() }));

        setExpenses(expensesData);
      } else {
        setExpenses([]);
      }
    } catch (error) {
      console.error("Failed to fetch group or expenses:", error);
      navigate("/equilo/home", { replace: true });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroup();
    // eslint-disable-next-line
  }, [groupId]);

  const handleAddExpense = async (expenseData) => {
    await fetchGroup();
  };

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
  const handleExportGroupData = async () => {
    try {
      const uid = user.uid;
      const myEmail = user.email;
      const isAdmin = uid === groupData.createdBy;

      const rows = [];

      // ──────────────── Expenses ────────────────
      rows.push(["Expenses"]);
      rows.push([
        "Expense Title",
        "Total Amount",
        "User Name",
        "User ID",
        "Contribution Amount",
        "Share Amount",
      ]);

      for (const exp of expenses) {
        const contribs = exp.contributions || [];
        const shares = exp.calculatedShares || [];

        const relevantIds = isAdmin
          ? [
              ...new Set([
                ...contribs.map((c) => c.id),
                ...shares.map((s) => s.id),
              ]),
            ]
          : [uid, myEmail];

        for (const id of relevantIds) {
          const contribution = contribs.find((c) => c.id === id);
          const share = shares.find((s) => s.id === id);

          if (contribution || share) {
            rows.push([
              exp.title || "Untitled",
              exp.totalAmount || 0,
              resolvedMembers.find((m) => m.id === id)?.name || id,
              id,
              contribution?.amount || 0,
              share?.amount || 0,
            ]);
          }
        }
      }

      rows.push([""]); // Spacer

      // ──────────────── Payments ────────────────
      rows.push(["Payments"]);
      rows.push(["From", "To", "Amount", "Method", "Expense ID"]);

      const q1 = query(
        collection(db, "payments"),
        where("groupId", "==", groupId)
      );
      const snap = await getDocs(q1);
      const allPayments = snap.docs.map((d) => d.data());

      const payments = isAdmin
        ? allPayments
        : allPayments.filter((p) => p.fromUserId === uid || p.toUserId === uid);

      for (const p of payments) {
        rows.push([
          resolvedMembers.find((m) => m.id === p.fromUserId)?.name ||
            p.fromUserId,
          resolvedMembers.find((m) => m.id === p.toUserId)?.name || p.toUserId,
          p.amountPaid || 0,
          p.method || "N/A",
          p.expenseId || "-",
        ]);
      }

      // ──────────────── Download ────────────────
      const csv = rows.map((r) => r.join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${isAdmin ? "group" : "my"}_data_${groupId}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export failed:", err);
    }
  };

  if (loading) return <div className="group-loader">Loading group info...</div>;
  if (!groupData) return <div className="group-error">Group not found.</div>;

  return (
    <>
      <button
        onClick={handleExportGroupData}
        style={{
          marginTop: "1rem",
          padding: "8px 16px",
          background: "var(--primary)",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        ⬇️ Export {user?.uid === groupData.createdBy ? "Full Group" : "My"} Data
        (CSV)
      </button>

      <div className="group-page">
        <h2 className="group-title">{groupData.groupName}</h2>
        <p className="group-desc">
          {groupData.description || "No description."}
        </p>
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
      </div>

      {user?.uid === groupData.createdBy && (
        <button
          className="btn-add-expense full-width"
          onClick={() => setExpenseOpen(true)}
        >
          ➕ Add Expense
        </button>
      )}

      {user && groupData && (
        <AddExpenseModal
          isOpen={expenseOpen}
          onClose={() => setExpenseOpen(false)}
          groupId={groupId}
          onAdd={handleAddExpense}
          members={resolvedMembers}
          currentUserId={user.uid}
          currentUserName={user.displayName || user.userName}
          groupName={groupData.groupName}
        />
      )}

      <div className="group-expenses">
        <h3 className="group-expenses-heading">Expenses</h3>
        {expenses.length === 0 && <p>No expenses added yet.</p>}
        <ul className="expense-list">
          <div className="expense-button-container">
            {expenses.map((exp) => (
              <button
                key={exp.expenseId || exp.id}
                className="expense-button"
                onClick={() => setSelectedExpense(exp)}
              >
                {exp.title} - RS. {exp.totalAmount?.toFixed(2)}
              </button>
            ))}
          </div>
        </ul>
      </div>

      {/* ✅ New breakdown component */}
      <GroupDebtsBreakdown groupId={groupId} />

      {selectedExpense && (
        <ExpenseDetailsModal
          expense={selectedExpense}
          members={resolvedMembers}
          onClose={() => setSelectedExpense(null)}
        />
      )}
      <div className="group-chart-section">
        <h3>Your Personal Expense Balance Overview</h3>
        <UserGroupExpenseCharts groupId={groupId} />
      </div>
    </>
  );
};

export default Group;
