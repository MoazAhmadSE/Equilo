// src/components/AddExpenseModal.js

import React, { useState } from "react";
import "../css/components/AddExpenseModal.css";
import { addGroupExpense } from "../firebase/utils/expenseHandlers";
import { sendExpenseNotifications } from "../utils/sendExpenseNotifications";

const AddExpenseModal = ({
  isOpen,
  onClose,
  groupId,
  onAdd,
  members = [],
  currentUserId,
  currentUserName,
  groupName,
}) => {
  const [description, setDescription] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [contributions, setContributions] = useState(
    members.map((m) => ({
      id: m.id,
      role: "not-included",
      amount: "",
      discountType: "none",
      discountValue: "",
      redistributeRemaining: true,
    }))
  );

  const handleContributionChange = (id, field, value) => {
    setContributions((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  const getCalculatedShares = () => {
    const total = parseFloat(totalAmount || 0);
    const splitters = contributions.filter(
      (c) => c.role === "split" || c.role === "paid"
    );

    let remaining = total;
    let customAmountMembers = [];
    let fixedAmountTotal = 0;

    splitters.forEach((s) => {
      if (s.discountType === "custom-amount") {
        const amt = parseFloat(s.discountValue || 0);
        fixedAmountTotal += amt;
        customAmountMembers.push({ ...s, finalAmount: amt, note: "Custom" });
      }
    });

    remaining -= fixedAmountTotal;

    const eligible = splitters.filter(
      (s) => s.discountType !== "custom-amount" && s.redistributeRemaining
    );

    let totalWeight = 0;
    const weights = [];

    eligible.forEach((s) => {
      let weight = 1;
      const discount = parseFloat(s.discountValue || 0);
      if (s.discountType === "get-discount") weight -= discount / 100;
      else if (s.discountType === "give-discount") weight += discount / 100;
      if (weight < 0) weight = 0;
      weights.push({ ...s, weight });
      totalWeight += weight;
    });

    const sharedMembers = weights.map((s) => {
      const share = totalWeight > 0 ? (s.weight / totalWeight) * remaining : 0;
      return {
        ...s,
        finalAmount: share,
        note:
          s.discountType === "get-discount"
            ? "Got Discount"
            : s.discountType === "give-discount"
            ? "Gave Discount"
            : s.role === "paid"
            ? "Paid & Consumed"
            : "Split",
      };
    });

    const combined = [...customAmountMembers, ...sharedMembers];
    const result = members.map((m) => {
      const found = combined.find((s) => s.id === m.id);
      return {
        id: m.id,
        name: m.name,
        finalAmount: found?.finalAmount || 0,
        note: found?.note || "",
      };
    });

    return result;
  };

  const getSettlementMatrix = () => {
    const payers = contributions
      .filter((c) => c.role === "paid")
      .map((c) => ({ ...c, paid: parseFloat(c.amount || 0) }))
      .filter((c) => c.paid > 0);

    const splitters = getCalculatedShares();

    const balances = members.map((m) => {
      const paid = payers.find((p) => p.id === m.id)?.paid || 0;
      const owed = splitters.find((s) => s.id === m.id)?.finalAmount || 0;
      return { id: m.id, name: m.name, net: paid - owed };
    });

    const debtors = balances.filter((b) => b.net < 0);
    const creditors = balances.filter((b) => b.net > 0);

    const settlements = [];
    let sortedDebtors = [...debtors].sort((a, b) => a.net - b.net);
    let sortedCreditors = [...creditors].sort((a, b) => b.net - a.net);

    for (let debtor of sortedDebtors) {
      let debt = -debtor.net;

      for (let creditor of sortedCreditors) {
        if (debt === 0) break;
        if (creditor.net === 0) continue;

        const payAmount = Math.min(debt, creditor.net);

        // console.log(debtor, creditor);
        settlements.push({
          from: debtor.id,
          to: creditor.id,
          amount: payAmount,
        });

        debt -= payAmount;
        creditor.net -= payAmount;
      }
    }

    return settlements;
  };

  const calculatedShares = getCalculatedShares();
  const settlementPlan = getSettlementMatrix();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !description ||
      !totalAmount ||
      isNaN(totalAmount) ||
      parseFloat(totalAmount) <= 0
    ) {
      alert("Please enter a valid description and total amount.");
      return;
    }

    // Optional: Validate contributions for 'paid' roles have positive amounts
    for (const c of contributions) {
      if (
        c.role === "paid" &&
        (isNaN(parseFloat(c.amount)) || parseFloat(c.amount) <= 0)
      ) {
        alert(
          `Please enter a valid amount paid by ${
            members.find((m) => m.id === c.id)?.name || c.id
          }`
        );
        return;
      }
    }

    const expenseData = {
      description,
      totalAmount: parseFloat(totalAmount),
      contributions,
      calculatedShares,
      settlementPlan,
      groupId,
      createdBy: currentUserId,
      // createdAt removed to use serverTimestamp in Firestore
    };

    try {
      await addGroupExpense(expenseData);

      if (onAdd) onAdd(expenseData);

      onClose();

      await sendExpenseNotifications({
        members,
        groupName,
        expenseTitle: description,
        totalAmount: parseFloat(totalAmount),
        addedByName: currentUserName,
        calculatedShares,
        settlementPlan,
        groupId,
      });
    } catch (error) {
      console.error("Failed to add expense:", error);
      alert("Failed to add expense. Please try again.");
    }
  };

  if (!isOpen) return null;

  if (!currentUserId) {
    alert("Error: Current user ID is not available. Cannot add expense.");
    return;
  }

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
              type="number"
              placeholder="Total Amount"
              value={totalAmount}
              onChange={(e) => setTotalAmount(e.target.value)}
              required
            />
          </div>

          <div className="expense-section">
            <label>Member Contributions</label>
            <div className="member-list">
              {members.map((m) => {
                const c = contributions.find((x) => x.id === m.id);
                return (
                  <div
                    key={m.id}
                    className={`member-row ${!m.isJoined ? "blurred" : ""}`}
                  >
                    <div className="member-info">
                      <span>{m.name}</span>
                      <span className="member-email">{m.email}</span>
                    </div>
                    <select
                      value={c.role}
                      onChange={(e) =>
                        handleContributionChange(m.id, "role", e.target.value)
                      }
                      disabled={!m.isJoined}
                    >
                      <option value="not-included">Not Included</option>
                      <option value="paid">Paid</option>
                      <option value="split">Split</option>
                    </select>

                    {c.role === "paid" && (
                      <input
                        type="number"
                        placeholder="Amount Paid"
                        value={c.amount}
                        className="amount-input"
                        onChange={(e) =>
                          handleContributionChange(
                            m.id,
                            "amount",
                            e.target.value
                          )
                        }
                      />
                    )}

                    {c.role === "split" && (
                      <div className="split-options">
                        <div className="discount-with-tooltip">
                          <select
                            value={c.discountType}
                            onChange={(e) =>
                              handleContributionChange(
                                m.id,
                                "discountType",
                                e.target.value
                              )
                            }
                          >
                            <option value="none">No Discount</option>
                            <option value="get-discount">Get Discount</option>
                            <option value="give-discount">Give Discount</option>
                            <option value="custom-amount">Custom Amount</option>
                          </select>
                          <span className="tooltip">
                            ?
                            <span className="tooltiptext">
                              "Get Discount": Pay less than your share.
                              <br />
                              "Give Discount": Pay more.
                              <br />
                              "Custom": Exact share manually.
                            </span>
                          </span>
                        </div>
                        {c.discountType !== "none" && (
                          <input
                            type="number"
                            placeholder={
                              c.discountType === "custom-amount"
                                ? "Custom Amount"
                                : "Discount Value"
                            }
                            value={c.discountValue}
                            onChange={(e) =>
                              handleContributionChange(
                                m.id,
                                "discountValue",
                                e.target.value
                              )
                            }
                            className="amount-input"
                          />
                        )}
                        {c.discountType !== "none" && (
                          <select
                            value={c.redistributeRemaining ? "yes" : "no"}
                            onChange={(e) =>
                              handleContributionChange(
                                m.id,
                                "redistributeRemaining",
                                e.target.value === "yes"
                              )
                            }
                          >
                            <option value="yes">Redistribute Remaining</option>
                            <option value="no">Don't Redistribute</option>
                          </select>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="shares-preview">
            <label>Calculated Shares</label>
            <ul>
              {calculatedShares.map((s) => (
                <li key={s.id}>
                  {s.name}: {s?.finalAmount?.toFixed(2)}{" "}
                  {s.note && `(${s.note})`}
                </li>
              ))}
            </ul>
          </div>

          <div className="settlement-preview">
            <label>Settlement Plan</label>
            <ul>
              {settlementPlan.map((s, i) => (
                <li key={i}>
                  {s.from} pays {s.to}: {s?.amount?.toFixed(2)}
                </li>
              ))}
            </ul>
          </div>

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
