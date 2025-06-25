import React from "react";
import "../css/components/ExpenseDetailsModal.css";

const ExpenseDetailsModal = ({ expense, members, onClose }) => {
  const getName = (id) => members.find((m) => m.id === id)?.name || id;

  return (
    <div className="modal-backdrop">
      <div className="modal-box">
        <h2>{expense.title}</h2>
        <p>
          <strong>Total:</strong> ₹{expense.totalAmount.toFixed(2)}
        </p>

        <div className="section">
          <h4>Paid By</h4>
          <ul>
            {expense.contributions
              .filter((c) => c.role === "paid")
              .map((c) => (
                <li key={c.id}>
                  {getName(c.id)} — ₹{parseFloat(c.amount).toFixed(2)}
                </li>
              ))}
          </ul>
        </div>

        <div className="section">
          <h4>Shares</h4>
          <ul>
            {expense.calculatedShares.map((s) => (
              <li key={s.id}>
                {getName(s.id)} — ₹{s.finalAmount.toFixed(2)}
                {s.note && <em> ({s.note})</em>}
              </li>
            ))}
          </ul>
        </div>

        <div className="section">
          <h4>Settlement Plan</h4>
          <ul>
            {expense.settlementPlan.map((s, idx) => (
              <li key={idx}>
                {getName(s.from)} pays {getName(s.to)}: ₹{s.amount.toFixed(2)}
              </li>
            ))}
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
