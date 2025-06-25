import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { useParams } from "react-router-dom";
import { db } from "../firebase/firebaseConfig";
import { useAuth } from "../context/AuthContext";
import "../css/components/GroupDebtsBreakdown.css";

const GroupDebtsBreakdown = () => {
  const { user } = useAuth();
  const { groupId } = useParams();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedExpenseId, setExpandedExpenseId] = useState(null);

  useEffect(() => {
    if (!user?.uid || !groupId) return;

    const load = async () => {
      setLoading(true);

      const balancesFromQuery = query(
        collection(db, "balances"),
        where("groupId", "==", groupId),
        where("fromUserId", "==", user.uid)
      );

      const balancesToQuery = query(
        collection(db, "balances"),
        where("groupId", "==", groupId),
        where("toUserId", "==", user.uid)
      );

      const [fromSnap, toSnap] = await Promise.all([
        getDocs(balancesFromQuery),
        getDocs(balancesToQuery),
      ]);

      const allBalances = [...fromSnap.docs, ...toSnap.docs];
      const expensesMap = {};

      for (const docSnap of allBalances) {
        const balance = docSnap.data();
        if (balance.amount === 0) continue;

        const eid = balance.expenseId || "unlinked";
        const direction = balance.fromUserId === user.uid ? "up" : "down";
        const otherId =
          direction === "up" ? balance.toUserId : balance.fromUserId;

        // Get other user's name
        let otherName = "Unknown";
        try {
          const userSnap = await getDoc(doc(db, "users", otherId));
          if (userSnap.exists()) {
            otherName = userSnap.data().userName || "Unknown";
          }
        } catch (err) {
          console.warn("Failed to fetch user:", otherId);
        }

        // Get expense title
        if (!expensesMap[eid]) {
          let title = "💼 Miscellaneous Debts";
          try {
            if (balance.expenseId) {
              const expenseSnap = await getDoc(doc(db, "expenses", eid));
              if (expenseSnap.exists()) {
                title = expenseSnap.data().title || title;
              }
            }
          } catch (err) {
            console.warn("Failed to get expense title:", eid);
          }

          expensesMap[eid] = {
            id: eid,
            title,
            entries: [],
          };
        }

        expensesMap[eid].entries.push({
          otherName,
          otherId,
          amount: balance.amount,
          direction,
          balanceId: docSnap.id,
          expenseId: eid,
        });
      }

      setExpenses(Object.values(expensesMap));
      setLoading(false);
    };

    load();
  }, [user, groupId]);

  const handleToggle = (eid) => {
    setExpandedExpenseId((prev) => (prev === eid ? null : eid));
  };

  const handlePayNow = async (entry) => {
    if (!window.confirm(`Confirm payment of ₹${entry.amount.toFixed(2)}?`))
      return;

    try {
      // 1. Log the payment
      await addDoc(collection(db, "payments"), {
        fromUserId: user.uid,
        toUserId: entry.otherId,
        groupId,
        expenseId: entry.expenseId,
        amountPaid: entry.amount,
        paidAt: serverTimestamp(),
        method: "manual",
      });

      // 2. Mark balance as paid (zero)
      const balanceRef = doc(db, "balances", entry.balanceId);
      await updateDoc(balanceRef, {
        amount: 0,
        updatedAt: serverTimestamp(),
      });

      alert("✅ Payment recorded and balance cleared.");

      // 3. Optimistically update UI
      setExpenses((prev) =>
        prev
          .map((expense) => ({
            ...expense,
            entries: expense.entries.filter(
              (e) => e.balanceId !== entry.balanceId
            ),
          }))
          .filter((exp) => exp.entries.length > 0)
      );
    } catch (err) {
      console.error("❌ Payment logging failed", err);
      alert("Something went wrong.");
    }
  };

  return (
    <div className="group-debts-breakdown">
      <h3>💸 Your Debts in This Group</h3>

      {loading && <p className="loading-msg">Fetching your balances...</p>}

      {!loading && expenses.length === 0 && (
        <p className="no-debts-msg">🎉 You have no debts to pay!</p>
      )}

      {!loading &&
        expenses.map(({ id, title, entries }) => (
          <div key={id} className="expense-block">
            <div
              className="debt-toggle-header"
              onClick={() => handleToggle(id)}
            >
              <span>{title}</span>
              <span className="dropdown-arrow">
                {expandedExpenseId === id ? "▲" : "▼"}
              </span>
            </div>

            {expandedExpenseId === id && (
              <div className="debt-row-list">
                {entries.map((e, idx) => (
                  <div key={idx} className="debt-row-item">
                    <span className="debt-user">
                      {e.direction === "down"
                        ? `${e.otherName} owes you`
                        : `You owe ${e.otherName}`}
                    </span>
                    <span className="debt-amount">₹{e.amount.toFixed(2)}</span>
                    <span
                      style={{
                        color: e.direction === "down" ? "green" : "red",
                        fontSize: "1.2rem",
                      }}
                    >
                      {e.direction === "down" ? "💰" : "📤"}
                    </span>

                    {e.direction === "up" && (
                      <button
                        className="pay-button"
                        onClick={() => handlePayNow(e)}
                      >
                        Pay Now
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
    </div>
  );
};

export default GroupDebtsBreakdown;
