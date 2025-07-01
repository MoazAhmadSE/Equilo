import React from "react";
import "../css/components/ExpenseDetailsModal.css";

const ExpenseDetailsModal = ({
  expense,
  members,
  onClose,
  currentUserId,
  onPay,
}) => {
  const getName = (id) => {
    const member = members.find(
      (m) => String(m.id).trim() === String(id).trim()
    );
    if (!member) console.warn(`❌ getName failed for ID: '${id}'`);
    return member?.name || id;
  };

  const yourSettlement = expense.settlementPlan?.find(
    (s) => String(s.from || s.fromUserId) === String(currentUserId)
  );

  const peopleWhoOweYou = expense.settlementPlan?.filter(
    (s) => String(s.to || s.toUserId) === String(currentUserId)
  );

  return (
    <div className="modal-backdrop">
      <div className="modal-box">
        <h2 className="modal-title">{expense?.title || "Untitled Expense"}</h2>

        <p className="total-amount">
          <strong>Total:</strong>{" "}
          <span className="highlight">
            RS.{Number(expense.totalAmount || 0).toFixed(2)}
          </span>
        </p>

        {expense.contributions?.length > 0 && (
          <div className="section">
            <h4>Paid By</h4>
            <ul>
              {expense.contributions
                .filter((c) => c.role === "paid")
                .map((c) => (
                  <li key={c.id}>
                    {getName(c.id)} — RS.{parseFloat(c.amount).toFixed(2)}
                  </li>
                ))}
            </ul>
          </div>
        )}

        {expense.calculatedShares?.length > 0 && (
          <div className="section">
            <h4>Shares</h4>
            <ul>
              {expense.calculatedShares.map((s) => (
                <li key={s.id}>
                  {getName(s.id)} — RS.{s.finalAmount.toFixed(2)}
                  {s.note && <em> ({s.note})</em>}
                </li>
              ))}
            </ul>
          </div>
        )}

        {expense.settlementPlan?.length > 0 && (
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
                    {getName(from)} ➜ {getName(to)}: RS.{amount.toFixed(2)}
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {yourSettlement && (
          <div className="pay-box">
            <p>
              💸 You need to pay{" "}
              <strong className="highlight">
                {getName(yourSettlement.to || yourSettlement.toUserId)}
              </strong>
              : RS.{yourSettlement.amount.toFixed(2)}
            </p>
            <button
              className="btn-pay"
              onClick={() =>
                onPay({
                  to: yourSettlement.to || yourSettlement.toUserId,
                  amount: yourSettlement.amount,
                })
              }
            >
              Pay Now
            </button>
          </div>
        )}

        {peopleWhoOweYou?.length > 0 && (
          <div className="pay-box">
            <h4>People Who Owe You</h4>
            {peopleWhoOweYou.map((s, idx) => (
              <div key={idx} className="debt-row-item">
                <span>
                  {getName(s.fromUserId || s.from)} owes you: RS.
                  {s.amount.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        )}

        <button className="btn-close" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default ExpenseDetailsModal;
