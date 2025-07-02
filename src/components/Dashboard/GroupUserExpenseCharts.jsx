// import React, { useEffect, useState } from "react";
// import { doc, getDoc, collection, getDocs } from "firebase/firestore";
// import { db } from "../firebase/firebaseConfig";
// import { BarChart } from "@mui/x-charts/BarChart";
// import "../css/components/AddExpenseModal.css";

// // Chart component reused as-is
// const UserExpenseBarChart = ({ barData, title }) => {
//   if (!barData.length) return <p>No data to display for {title}.</p>;

//   const total = barData.reduce((sum, entry) => sum + entry.value, 0);

//   return (
//     <>
//       <h3 style={{ color: "var(--text)", marginBottom: "0.5rem" }}>
//         {title} –{" "}
//         <span style={{ color: "var(--primary)" }}>Rs {total.toFixed(2)}</span>
//       </h3>
//       <BarChart
//         series={[{ data: barData.map(({ value }) => value) }]}
//         xAxis={[
//           {
//             scaleType: "band",
//             data: barData.map(({ label }) => label),
//             tickLabelStyle: { fill: "var(--text)", fontSize: 12 },
//             axisLine: { stroke: "var(--text)" },
//             tickLine: { stroke: "var(--text)" },
//           },
//         ]}
//         yAxis={[
//           {
//             tickLabelStyle: { fill: "var(--text)", fontSize: 12 },
//             axisLine: { stroke: "var(--text)" },
//             tickLine: { stroke: "var(--text)" },
//           },
//         ]}
//         width={600}
//         height={300}
//         sx={{
//           "& .MuiChartsAxis-tickLabel": { fill: "var(--text)" },
//           "& .MuiChartsAxis-line": { stroke: "var(--text)" },
//           "& .MuiChartsAxis-tick": { stroke: "var(--text)" },
//         }}
//         slotProps={{
//           tooltip: {
//             children: ({ item }) => (
//               <div style={{ padding: 6 }}>
//                 <strong>{barData[item.index].label}</strong>
//                 <div>Amount: Rs {barData[item.index].value.toFixed(2)}</div>
//               </div>
//             ),
//           },
//         }}
//       />
//     </>
//   );
// };

// // Helper to build expense data for one user
// const buildExpenseData = (expenses, user) => {
//   const identifiers = [user.userId, user.userEmail];
//   const paidData = [],
//     oweData = [],
//     getData = [];

//   expenses.forEach((exp, idx) => {
//     const paidEntry = exp.contributions?.find((p) =>
//       identifiers.includes(p.id)
//     );
//     const shareEntry = exp.calculatedShares?.find((s) =>
//       identifiers.includes(s.id)
//     );

//     const paidAmount = paidEntry ? parseFloat(paidEntry.amount || 0) : 0;
//     const shareAmount = shareEntry
//       ? parseFloat(shareEntry.finalAmount || 0)
//       : 0;
//     const balance = paidAmount - shareAmount;
//     const label = exp.title || exp.description || `Expense ${idx + 1}`;

//     if (paidAmount > 0) paidData.push({ id: idx, value: paidAmount, label });
//     if (balance < 0) oweData.push({ id: idx, value: Math.abs(balance), label });
//     if (balance > 0) getData.push({ id: idx, value: balance, label });
//   });

//   return { paidData, oweData, getData };
// };

// // MAIN COMPONENT
// export default function GroupUserExpenseCharts({ groupId }) {
//   const [expenses, setExpenses] = useState([]);
//   const [groupUsers, setGroupUsers] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [statusMessage, setStatusMessage] = useState("");

//   useEffect(() => {
//     if (!groupId) return;

//     const fetchData = async () => {
//       try {
//         setLoading(true);
//         const groupSnap = await getDoc(doc(db, "groups", groupId));
//         if (!groupSnap.exists()) {
//           setStatusMessage("Group not found.");
//           return;
//         }

//         const groupData = groupSnap.data();
//         const expenseIds = groupData.expenseIds || [];
//         const memberIds = groupData.members || [];

//         // Fetch all expenses
//         const fetchedExpenses = [];
//         for (const expenseId of expenseIds) {
//           const expenseSnap = await getDoc(doc(db, "expenses", expenseId));
//           if (expenseSnap.exists()) fetchedExpenses.push(expenseSnap.data());
//         }

//         // Fetch all users
//         const fetchedUsers = [];
//         for (const memberId of memberIds) {
//           let userDoc = await getDoc(doc(db, "users", memberId));
//           if (userDoc.exists()) {
//             fetchedUsers.push(userDoc.data());
//           } else {
//             // fallback if only email is stored in memberId
//             fetchedUsers.push({
//               userId: memberId,
//               userName: memberId,
//               userEmail: memberId,
//             });
//           }
//         }

//         setExpenses(fetchedExpenses);
//         setGroupUsers(fetchedUsers);
//       } catch (err) {
//         console.error("Error loading data:", err);
//         setStatusMessage("Failed to load data.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [groupId]);

//   return (
//     <div>
//       {loading && <p>Loading... {statusMessage}</p>}
//       {!loading &&
//         groupUsers.map((user, idx) => {
//           const { paidData, oweData, getData } = buildExpenseData(
//             expenses,
//             user
//           );
//           return (
//             <div
//               key={user.userId || user.userEmail}
//               style={{ marginBottom: "2rem" }}
//             >
//               <h2 style={{ color: "var(--primary)" }}>
//                 {user.userName || user.userEmail}
//               </h2>
//               <UserExpenseBarChart barData={paidData} title="Total Spent" />
//               <UserExpenseBarChart barData={oweData} title="Total To Pay" />
//               <UserExpenseBarChart barData={getData} title="Total To Receive" />
//             </div>
//           );
//         })}
//     </div>
//   );
// }
import React, { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { BarChart, PieChart } from "@mui/x-charts";
import { useAuth } from "../../context/AuthContext";
import useUserProfile from "../../firebase/utils/useUserProfile";

const buildUserExpenseData = (expenses, user) => {
  const identifiers = [user.userId, user.userEmail];
  let paid = 0,
    owe = 0,
    get = 0;

  expenses.forEach((exp) => {
    const paidEntry = exp.contributions?.find((c) =>
      identifiers.includes(c.id)
    );
    const shareEntry = exp.calculatedShares?.find((s) =>
      identifiers.includes(s.id)
    );

    const paidAmount = paidEntry ? parseFloat(paidEntry.amount || 0) : 0;
    const shareAmount = shareEntry
      ? parseFloat(shareEntry.finalAmount || 0)
      : 0;

    const balance = paidAmount - shareAmount;

    paid += paidAmount;
    if (balance < 0) owe += Math.abs(balance);
    if (balance > 0) get += balance;
  });

  return { paid, owe, get };
};

const UserGroupExpenseCharts = () => {
  const { user } = useAuth();
  const { userData, loading } = useUserProfile();

  const [groupNames, setGroupNames] = useState([]);
  const [groupsData, setGroupsData] = useState([]);
  const [selectedGroupIndex, setSelectedGroupIndex] = useState(null);

  useEffect(() => {
    if (!user || !userData || loading) return;

    const loadData = async () => {
      const groups = userData.joinedGroupIds || [];
      const names = [];
      const groupsSummary = [];

      for (const groupId of groups) {
        const groupDoc = await getDoc(doc(db, "groups", groupId));
        if (!groupDoc.exists()) continue;

        const group = groupDoc.data();
        const groupName = group.groupName || "Unnamed Group";
        names.push(groupName);

        const expenses = [];
        for (const expenseId of group.expenseIds || []) {
          const expenseDoc = await getDoc(doc(db, "expenses", expenseId));
          if (expenseDoc.exists()) expenses.push(expenseDoc.data());
        }

        const { paid, owe, get } = buildUserExpenseData(expenses, {
          userId: user.uid,
          userEmail: user.email,
        });

        groupsSummary.push({ paid, owe, get });
      }

      setGroupNames(names);
      setGroupsData(groupsSummary);
      setSelectedGroupIndex(names.length > 0 ? 0 : null);
    };

    loadData();
  }, [user, userData, loading]);

  if (loading || !userData || groupNames.length === 0) return null;

  const selectedGroupData =
    selectedGroupIndex !== null ? groupsData[selectedGroupIndex] : null;

  const pieData = selectedGroupData
    ? [
        { id: "Total Spent", value: selectedGroupData.paid, color: "#2196f3" },
        { id: "Total To Pay", value: selectedGroupData.owe, color: "#e91e63" },
        {
          id: "Total To Receive",
          value: selectedGroupData.get,
          color: "#4caf50",
        },
      ]
    : [];

  return (
    <div
      style={{
        display: "flex",
        gap: "2rem",
        marginTop: "2rem",
        color: "var(--text)",
      }}
    >
      <div
        style={{
          width: "25%",
          borderRight: "1px solid var(--border)",
          paddingRight: "1rem",
          overflowY: "auto",
          maxHeight: "400px",
        }}
      >
        <h3>Your Groups</h3>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {groupNames.map((name, idx) => (
            <li
              key={idx}
              onClick={() => setSelectedGroupIndex(idx)}
              style={{
                cursor: "pointer",
                padding: "0.3rem 1rem",
                backgroundColor:
                  selectedGroupIndex === idx ? "var(--card)" : "transparent",
                borderRadius: "4px",
                marginBottom: "0.3rem",
                fontWeight: selectedGroupIndex === idx ? "bold" : "normal",
              }}
            >
              {name}
            </li>
          ))}
        </ul>
      </div>

      <div style={{ flexGrow: 1 }}>
        <h3>
          {selectedGroupIndex !== null ? groupNames[selectedGroupIndex] : ""}
        </h3>
        {pieData.length > 0 ? (
          <PieChart
            series={[
              {
                data: pieData.map((slice) => ({
                  ...slice,
                  label: `${slice.id}: ${slice.value.toFixed(2)}`,
                })),
                innerRadius: 35,
                outerRadius: 100,
                paddingAngle: 2,
                cornerRadius: 4,
                startAngle: 0,
                endAngle: 360,
                labelPosition: "outside",
                labels: {
                  visible: true,
                  style: { fill: "var(--text)", fontWeight: "bold" },
                },
              },
            ]}
            height={300}
            // tooltip={false}
            sx={{
              ".MuiChartsLegend-root": {
                color: "var(--text)",
              },
              ".MuiChartsLegend-label": {
                fill: "var(--text)",
              },
            }}
          />
        ) : (
          <p>No data to display</p>
        )}
      </div>
    </div>
  );
};

export default UserGroupExpenseCharts;
