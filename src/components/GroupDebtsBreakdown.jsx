import React from "react";
import "../css/components/UserDebtsByGroup.css";

const ExpenseDetailsModal = ({ expense, members, currentUserId, onClose }) => {
  const getName = (id) => {
    const member = members.find(
      (m) => String(m.id).trim() === String(id).trim()
    );
    if (!member) console.warn(`❌ getName failed for ID: '${id}'`);
    return member?.name || id;
  };

  const isCurrent = (id) => String(id).trim() === String(currentUserId).trim();

  return (
    <div className="modal-backdrop">
      <div className="modal-box">
        <h2 className="section-heading">💼 {expense.title}</h2>

        <div className="debt-buttons">
          {expense.settlementPlan.map((s, idx) => {
            const from = s.from || s.fromUserId;
            const to = s.to || s.toUserId;
            const amount = s.amount;

            if (!from || !to || typeof amount !== "number") {
              console.warn("⚠️ Skipping invalid settlement entry", s);
              return null;
            }

            const fromName = isCurrent(from) ? "You" : getName(from);
            const toName = isCurrent(to) ? "You" : getName(to);
            const isUserPays = isCurrent(from);
            const isUserReceives = isCurrent(to);
            const color = isUserPays
              ? "red"
              : isUserReceives
              ? "green"
              : "inherit";

            return (
              <div key={idx} className="debt-row-item">
                <span className="debt-user">
                  {fromName} ➡️ {toName}
                </span>
                <span className="debt-amount">₹{amount.toFixed(2)}</span>
                <span style={{ color }}>
                  {isUserPays ? "🔺" : isUserReceives ? "🔻" : "➡️"}
                </span>
              </div>
            );
          })}
        </div>

        <div className="section">
          <h4 className="section-heading">📌 Additional Info</h4>

          <div className="debt-subsection">
            <h5>💰 Paid By</h5>
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

          <div className="debt-subsection">
            <h5>📤 Shares</h5>
            <ul>
              {expense.calculatedShares.map((s) => (
                <li key={s.id}>
                  {getName(s.id)} — ₹{s.finalAmount.toFixed(2)}
                  {s.note && <em> ({s.note})</em>}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <button className="btn-close" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default ExpenseDetailsModal;
