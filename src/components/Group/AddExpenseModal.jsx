import React, { useState, useMemo } from "react";
import MemberRow from "./GroupCreation/MemberRow";
import SharePreview from "./GroupCreation/SharePreview";
import SettlementPreview from "./GroupCreation/SettlementPreview";
import {
  calculateShares,
  calculateSettlementMatrix,
  validateExpense,
} from "./GroupCreation/expenseCalculations";

import { addGroupExpense } from "../../firebase/utils/expenseHandlers";
import "../../css/components/AddExpenseModal.css";
import { toast } from "react-toastify";

const AddExpenseModal = ({
  isOpen,
  onClose,
  groupId,
  onAdd,
  members = [],
  currentUserId,
}) => {
  const [description, setDescription] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [error, setError] = useState(null);

  const [contributions, setContributions] = useState(
    members.map((m) => ({
      id: m.id,
      role: "not-included",
      amount: "",
    }))
  );

  const handleChange = (id, field, value) => {
    setContributions((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;

        if (field === "role") {
          return {
            ...c,
            role: value,
            amount: value === "paid" ? c.amount : "",
          };
        }

        if (
          (field === "amount" && value === "") ||
          /^\d*\.?\d{0,2}$/.test(value)
        ) {
          return {
            ...c,
            amount: value,
          };
        }

        return c;
      })
    );
  };

  const handleAmountChange = (e) => {
    const value = e.target.value;
    if (value === "" || /^\d*\.?\d{0,2}$/.test(value)) {
      setTotalAmount(value);
    }
  };

  const totalPaid = useMemo(() => {
    return contributions
      .filter((c) => c.role === "paid")
      .reduce((sum, c) => sum + parseFloat(c.amount || 0), 0);
  }, [contributions]);

  const calculatedShares = useMemo(
    () => calculateShares(totalAmount, contributions, members),
    [totalAmount, contributions]
  );

  const settlementPlan = useMemo(
    () => calculateSettlementMatrix(contributions, calculatedShares, members),
    [contributions, calculatedShares]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateExpense(
      description,
      totalAmount,
      contributions,
      members
    );

    if (validationError) {
      setError(validationError);
      return;
    }

    const totalFloat = parseFloat(totalAmount || 0);

    if (Math.abs(totalPaid - totalFloat) > 0.01) {
      toast.warn(
        `⚠️ Total paid (${totalPaid.toFixed(
          2
        )}) does not match total amount (${totalFloat.toFixed(2)}).`
      );
      return;
    }

    const expenseData = {
      description,
      totalAmount: totalFloat,
      contributions,
      calculatedShares,
      settlementPlan,
      groupId,
      createdBy: currentUserId,
    };

    try {
      await addGroupExpense(expenseData);
      onAdd?.(expenseData);
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to add expense.");
    }
  };

  if (!isOpen || !currentUserId) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h3>Add New Expense</h3>
        <form onSubmit={handleSubmit}>
          <div className="row-inputs">
            <input
              type="text"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Total Amount"
              value={totalAmount}
              onChange={handleAmountChange}
              required
            />
          </div>

          <div className="live-status">
            <p>Total Paid: {totalPaid.toFixed(2)}</p>
          </div>

          <div className="expense-section">
            <label>Member Contributions</label>
            <div className="member-list">
              {members.map((m) => (
                <MemberRow
                  key={m.id}
                  member={m}
                  contribution={contributions.find((x) => x.id === m.id)}
                  onChange={handleChange}
                />
              ))}
            </div>
          </div>

          <SharePreview shares={calculatedShares} />
          <SettlementPreview settlement={settlementPlan} members={members} />

          {error && <p className="error-msg">{error}</p>}

          <div className="footer-buttons">
            <button type="submit" className="btn-primary">
              Add Expense
            </button>
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddExpenseModal;
