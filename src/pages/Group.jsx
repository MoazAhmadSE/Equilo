import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import { useGroupData } from "../hooks/Group/useGroupData";

import GroupHeader from "../components/Group/GroupHeader";
import GroupMembersList from "../components/Group/GroupMembersList";
import GroupActions from "../components/Group/GroupActions";
import ExpensesList from "../components/Group/ExpensesList";
import ExportButton from "../components/Group/ExportButton";

import EditGroupModal from "../components/Group/EditGroupModal";
import AddExpenseModal from "../components/Group/AddExpenseModal";
import ExpenseDetailsModal from "../components/ExpenseDetailsModal";
import UserGroupExpenseCharts from "../components/GroupPieChart";

import deleteGroup from "../firebase/utils/deleteGroup";

import "../css/pages/Group.css";

const Group = () => {
  const { groupId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const {
    groupData,
    creatorName,
    resolvedMembers,
    expenses,
    loading,
    fetchGroup,
  } = useGroupData(groupId, user);

  const [editOpen, setEditOpen] = useState(false);
  const [expenseOpen, setExpenseOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);

  if (loading) return <div className="group-loader">Loading group info...</div>;
  if (!groupData) return <div className="group-error">Group not found.</div>;

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

  return (
    <>
      <ExportButton
        user={user}
        groupData={groupData}
        groupId={groupId}
        resolvedMembers={resolvedMembers}
        expenses={expenses}
      />

      <div className="group-page">
        <GroupHeader groupData={groupData} creatorName={creatorName} />

        <GroupMembersList members={resolvedMembers} />

        <GroupActions
          isAdmin={user?.uid === groupData.createdBy}
          onDelete={handleDeleteGroup}
          onEdit={() => setEditOpen(true)}
        />

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
          onAdd={fetchGroup}
          members={resolvedMembers}
          currentUserId={user.uid}
          currentUserName={user.displayName || user.userName}
          groupName={groupData.groupName}
        />
      )}

      <ExpensesList
        expenses={expenses.map((exp) => {
          let direction = null;
          const paid = exp.contributions?.find(
            (c) => c.id === user.uid && c.role === "paid"
          );
          const share = exp.calculatedShares?.find((s) => s.id === user.uid);

          if (share && share.finalAmount > 0 && !paid) {
            direction = "up"; // you owe money
          } else if (paid && share && paid.amount > share.finalAmount) {
            direction = "down"; // others owe you
          }

          return { ...exp, direction };
        })}
        onSelect={setSelectedExpense}
      />

      {selectedExpense && (
        <ExpenseDetailsModal
          expense={selectedExpense}
          members={resolvedMembers}
          currentUserId={user.uid}
          onClose={() => setSelectedExpense(null)}
          onPay={({ to, amount }) => {
            console.log("🔥 You are paying ₹" + amount + " to " + to);
            // Firestore ya confirmation logic yahan
          }}
        />
      )}

      <div className="group-chart-section">
        <UserGroupExpenseCharts groupId={groupId} />
      </div>
    </>
  );
};

export default Group;
