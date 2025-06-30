import { useEffect, useState, useMemo } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { useAuth } from "../context/AuthContext";
import { BarChart } from "@mui/x-charts/BarChart";
import "../css/components/GroupPieChart.css";

export default function ExpenseBarChartView({ groupId }) {
  const { user } = useAuth();

  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchGroupData = async () => {
      if (!groupId) return;
      setLoading(true);
      try {
        const groupDoc = await getDoc(doc(db, "groups", groupId));
        if (!groupDoc.exists()) {
          setError("Group not found.");
          return;
        }

        const { expenseIds = [] } = groupDoc.data();

        const fetchedExpenses = await Promise.all(
          expenseIds.map(async (id) => {
            const docSnap = await getDoc(doc(db, "expenses", id));
            return docSnap.exists() ? { id, ...docSnap.data() } : null;
          })
        );

        setExpenses(fetchedExpenses.filter(Boolean));
      } catch (err) {
        console.error(err);
        setError("Failed to fetch expenses.");
      } finally {
        setLoading(false);
      }
    };

    fetchGroupData();
  }, [groupId]);

  const chartData = useMemo(() => {
    const userMap = {};

    for (const exp of expenses) {
      exp.contributions?.forEach(({ id, amount }) => {
        userMap[id] ??= { paid: 0, share: 0 };
        userMap[id].paid += parseFloat(amount || 0);
      });
      exp.calculatedShares?.forEach(({ id, finalAmount }) => {
        userMap[id] ??= { paid: 0, share: 0 };
        userMap[id].share += parseFloat(finalAmount || 0);
      });
    }

    const labels = [];
    const paidData = [];
    const owesData = [];
    const getsBackData = [];

    for (const [uid, { paid, share }] of Object.entries(userMap)) {
      const balance = paid - share;
      labels.push(uid);
      paidData.push(paid);
      owesData.push(balance < 0 ? Math.abs(balance) : 0);
      getsBackData.push(balance > 0 ? balance : 0);
    }

    return { labels, paidData, owesData, getsBackData };
  }, [expenses]);

  if (loading || error)
    return (
      <div className="group-pie-chart-container">
        {loading ? "Loading chart..." : `Error: ${error}`}
      </div>
    );

  return (
    <div className="group-pie-chart-container">
      <h3>Group Expense Breakdown</h3>
      <div className="group-pie-chart-view">
        <BarChart
          xAxis={[{ data: chartData.labels, scaleType: "band", label: "User" }]}
          series={[
            { data: chartData.paidData, label: "Paid", color: "#4caf50" },
            { data: chartData.owesData, label: "Owes", color: "#f44336" },
            {
              data: chartData.getsBackData,
              label: "Gets Back",
              color: "#2196f3",
            },
          ]}
          height={350}
          slotProps={{
            legend: {
              position: { vertical: "bottom", horizontal: "middle" },
              direction: "row",
            },
          }}
        />
      </div>
    </div>
  );
}
