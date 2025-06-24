import React, { useState } from "react";
import "../css/components/AddExpenseModal.css";

const AddExpenseModal = ({ isOpen, onClose, groupId, onAdd, members = [] }) => {
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

  const handleSubmit = (e) => {
    e.preventDefault();
    const payers = contributions.filter(
      (c) => c.role === "paid" && parseFloat(c.amount) > 0
    );
    const splitters = contributions.filter((c) => c.role === "split");

    const paidTotal = payers.reduce(
      (sum, p) => sum + parseFloat(p.amount || 0),
      0
    );
    const total = parseFloat(totalAmount);

    if (paidTotal !== total) {
      alert("Paid amounts must equal total amount");
      return;
    }

    onAdd({
      description,
      amount: total,
      payers,
      splitWith: splitters.map((s) => ({
        id: s.id,
        discountType: s.discountType,
        discountValue: s.discountValue,
        redistributeRemaining: s.redistributeRemaining,
      })),
    });

    setDescription("");
    setTotalAmount("");
    setContributions(
      members.map((m) => ({
        id: m.id,
        role: "not-included",
        amount: "",
        discountType: "none",
        discountValue: "",
        redistributeRemaining: true,
      }))
    );
    onClose();
  };

  if (!isOpen) return null;

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
                        placeholder="Amount"
                        className="amount-input"
                        value={c.amount}
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

          <div className="modal-actions">
            <button type="submit" className="btn-add">
              ➕ Add
            </button>
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddExpenseModal;
