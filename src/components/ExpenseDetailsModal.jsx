import React from "react";
import "../css/components/ExpenseDetailsModal.css";

const ExpenseDetailsModal = ({ expense, members, onClose }) => {
  const getName = (id) => {
    const member = members.find(
      (m) => String(m.id).trim() === String(id).trim()
    );
    if (!member) console.warn(`❌ getName failed for ID: '${id}'`);
    return member?.name || id;
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-box">
        <h2>{expense.title}</h2>
        <p>
          <strong>Total:</strong> RS. {expense.totalAmount.toFixed(2)}
        </p>

        <div className="section">
          <h4>Paid By</h4>
          <ul>
            {expense.contributions
              .filter((c) => c.role === "paid")
              .map((c) => (
                <li key={c.id}>
                  {getName(c.id)} — RS. {parseFloat(c.amount).toFixed(2)}
                </li>
              ))}
          </ul>
        </div>

        <div className="section">
          <h4>Shares</h4>
          <ul>
            {expense.calculatedShares.map((s) => (
              <li key={s.id}>
                {getName(s.id)} — RS. {s.finalAmount.toFixed(2)}
                {s.note && <em> ({s.note})</em>}
              </li>
            ))}
          </ul>
        </div>

        <div className="section">
          <h4>Settlement Plan</h4>
          <ul>
            {expense.settlementPlan.map((s, idx) => {
              const from = s.from || s.fromUserId;
              const to = s.to || s.toUserId;
              const amount = s.amount;

              if (!from || !to || typeof amount !== "number") {
                console.warn("⚠️ Skipping invalid settlement entry", s);
                return null;
              }

              return (
                <li key={idx}>
                  {getName(from)} pays {getName(to)}: RS. {amount.toFixed(2)}
                </li>
              );
            })}
          </ul>
        </div>

        <button className="btn-close" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default ExpenseDetailsModal;
