import React, { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { useAuth } from "../context/AuthContext";
import { PieChart } from "@mui/x-charts/PieChart";

const UserExpensePieChart = ({ expense, user }) => {
  if (!expense) return null;

  const identifiers = [user.uid, user.email];
  const title = expense.title || expense.description || "Untitled Expense";

  const paidEntry = expense.contributions?.find((c) =>
    identifiers.includes(c.id)
  );
  const shareEntry = expense.calculatedShares?.find((s) =>
    identifiers.includes(s.id)
  );

  const paidAmount = paidEntry ? parseFloat(paidEntry.amount || 0) : 0;
  const shareAmount = shareEntry ? parseFloat(shareEntry.finalAmount || 0) : 0;
  const balance = paidAmount - shareAmount;

  const data = [];
  if (paidAmount > 0)
    data.push({ id: 1, value: paidAmount, label: "You Paid" });
  if (balance < 0)
    data.push({ id: 2, value: Math.abs(balance), label: "You Owe" });
  if (balance > 0) data.push({ id: 3, value: balance, label: "You Get Back" });

  return (
    <div style={{ marginTop: "1rem" }}>
      <h3>{title}</h3>
      <PieChart
        series={[
          {
            data: data.map(({ id, value, label }) => ({ id, value, label })),
          },
        ]}
        width={300}
        height={300}
      />
    </div>
  );
};

export default function ExpensePieChartView() {
  const { user } = useAuth();
  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [selectedExpenseIdx, setSelectedExpenseIdx] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      const joinedGroupIds = userDoc.data()?.joinedGroupIds || [];

      if (!joinedGroupIds.length) return;

      const groupDoc = await getDoc(doc(db, "groups", joinedGroupIds[0]));
      const expenseIds = groupDoc.data()?.expenseIds || [];

      const expensesFetched = [];
      for (const expenseId of expenseIds) {
        const expDoc = await getDoc(doc(db, "expenses", expenseId));
        if (expDoc.exists()) expensesFetched.push(expDoc.data());
      }

      setGroup(groupDoc.data());
      setExpenses(expensesFetched);
    };

    fetchData();
  }, [user.uid]);

  return (
    <div style={{ display: "flex", padding: "1rem" }}>
      {/* Left: Expense List */}
      <div
        style={{
          width: "30%",
          paddingRight: "1rem",
          borderRight: "1px solid #ccc",
        }}
      >
        <h3>Expenses</h3>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {expenses.map((exp, i) => (
            <li
              key={i}
              onClick={() => setSelectedExpenseIdx(i)}
              style={{
                cursor: "pointer",
                padding: "0.5rem",
                background: i === selectedExpenseIdx ? "#eee" : "transparent",
                borderRadius: "4px",
              }}
            >
              {exp.title || exp.description || `Expense ${i + 1}`}
            </li>
          ))}
        </ul>
      </div>

      {/* Right: Pie Chart for Selected Expense */}
      <div style={{ flexGrow: 1, paddingLeft: "2rem" }}>
        {selectedExpenseIdx === null ? (
          <p>Select an expense to see your breakdown.</p>
        ) : (
          <UserExpensePieChart
            expense={expenses[selectedExpenseIdx]}
            user={user}
          />
        )}
      </div>
    </div>
  );
}
