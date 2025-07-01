import { useEffect, useState, useMemo } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { useAuth } from "../context/AuthContext";
import { BarChart } from "@mui/x-charts/BarChart";
import "../css/components/GroupPieChart.css";

export default function ExpenseBarChartView({ groupId }) {
  const { user } = useAuth();

  const [expenses, setExpenses] = useState([]);
  const [userMap, setUserMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchGroupData = async () => {
    if (!groupId) return;
    setLoading(true);
    try {
      const groupDoc = await getDoc(doc(db, "groups", groupId));
      if (!groupDoc.exists()) {
        setError("Group not found.");
        return;
      }

      const { expenseIds = [], members = [] } = groupDoc.data();

      // Fetch all expenses
      const fetchedExpenses = await Promise.all(
        expenseIds.map(async (id) => {
          const docSnap = await getDoc(doc(db, "expenses", id));
          return docSnap.exists() ? { id, ...docSnap.data() } : null;
        })
      );

      setExpenses(fetchedExpenses.filter(Boolean));

      // Fetch all group member names
      const memberDocs = await Promise.all(
        members.map(async (uid) => {
          const userSnap = await getDoc(doc(db, "users", uid));
          return userSnap.exists()
            ? { id: uid, name: userSnap.data().userName || uid }
            : { id: uid, name: uid };
        })
      );

      const nameMap = {};
      memberDocs.forEach(({ id, name }) => {
        nameMap[id] = name;
      });

      setUserMap(nameMap);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch expenses.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroupData();
  }, [groupId]);

  const chartData = useMemo(() => {
    const netOwes = {}; // total each user owes to others
    const netGetsBack = {}; // total each user should receive
    const totalPaid = {}; // just for chart
    const allUsers = new Set();

    for (const exp of expenses) {
      const contributions = exp.contributions || [];
      const shares = exp.calculatedShares || [];

      const payerMap = {};
      let totalPaidInExpense = 0;

      for (const c of contributions) {
        payerMap[c.id] = (payerMap[c.id] || 0) + parseFloat(c.amount || 0);
        totalPaidInExpense += parseFloat(c.amount || 0);
        allUsers.add(c.id);
        totalPaid[c.id] = (totalPaid[c.id] || 0) + parseFloat(c.amount || 0);
      }

      const shareMap = {};
      let totalShare = 0;

      for (const s of shares) {
        shareMap[s.id] = (shareMap[s.id] || 0) + parseFloat(s.finalAmount || 0);
        totalShare += parseFloat(s.finalAmount || 0);
        allUsers.add(s.id);
      }

      // Distribute each share to payers proportionally
      for (const [debtorId, debtorShare] of Object.entries(shareMap)) {
        for (const [creditorId, paidAmount] of Object.entries(payerMap)) {
          const fraction = paidAmount / totalPaidInExpense;
          const owesToCreditor = debtorShare * fraction;

          if (debtorId !== creditorId) {
            netOwes[debtorId] = (netOwes[debtorId] || 0) + owesToCreditor;
            netGetsBack[creditorId] =
              (netGetsBack[creditorId] || 0) + owesToCreditor;
          }
        }
      }
    }

    // Ensure all members exist in maps
    for (const uid of Object.keys(userMap)) {
      allUsers.add(uid);
      totalPaid[uid] = totalPaid[uid] || 0;
      netOwes[uid] = netOwes[uid] || 0;
      netGetsBack[uid] = netGetsBack[uid] || 0;
    }

    // Format for chart
    const labels = [];
    const paidData = [];
    const owesData = [];
    const getsBackData = [];

    for (const uid of allUsers) {
      const name = userMap[uid] || uid;
      labels.push(name);
      paidData.push(totalPaid[uid]);
      owesData.push(netOwes[uid]);
      getsBackData.push(netGetsBack[uid]);
    }

    return { labels, paidData, owesData, getsBackData };
  }, [expenses, userMap]);

  return (
    <div className="group-pie-chart-container">
      <h3>Group Expense Breakdown</h3>
      <div className="group-pie-chart-view">
        <BarChart
          height={400}
          borderRadius={5}
          xAxis={[
            {
              data: chartData.labels,
              scaleType: "band",
              label: "Member",
              tickLabelStyle: {
                fontSize: 12,
                angle: -30,
                textAnchor: "end",
              },
            },
          ]}
          yAxis={[
            {
              label: "Amount (PKR)",
              tickFormat: (v) => `₨${v}`,
            },
          ]}
          series={[
            {
              data: chartData.paidData,
              label: "Spent",
              color: "#eab308",
            },
            {
              data: chartData.owesData,
              label: "Owes",
              color: "#ef4444",
            },
            {
              data: chartData.getsBackData,
              label: "Gets Back",
              color: "#10b981",
            },
          ]}
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
