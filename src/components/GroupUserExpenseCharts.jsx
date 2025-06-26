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
import { db } from "../firebase/firebaseConfig";
import { BarChart } from "@mui/x-charts/BarChart";
import { useAuth } from "../context/AuthContext";
import useUserProfile from "../hooks/useUserProfile";

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
  const [paidData, setPaidData] = useState([]);
  const [oweData, setOweData] = useState([]);
  const [getData, setGetData] = useState([]);

  useEffect(() => {
    if (!user || !userData || loading) return;

    const loadData = async () => {
      const groups = userData.joinedGroupIds || [];

      const paidArr = [];
      const oweArr = [];
      const getArr = [];
      const names = [];

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

        paidArr.push(paid);
        oweArr.push(owe);
        getArr.push(get);
      }

      setGroupNames(names);
      setPaidData(paidArr);
      setOweData(oweArr);
      setGetData(getArr);
    };

    loadData();
  }, [user, userData, loading]);

  if (loading || !userData || groupNames.length === 0) return null;

  return (
    <div style={{ marginTop: "2rem" }}>
      <BarChart
        xAxis={[
          {
            scaleType: "band",
            data: groupNames,
            // categoryGapRatio: 0.3,
            // barGapRatio: 0.1,
          },
        ]}
        yAxis={[
          {
            tickLabelStyle: {
              fill: "none",
            },
            axisLine: { stroke: "gray" },
            tickLine: { stroke: "none" },
          },
        ]}
        series={[
          { data: paidData, label: "Total Spent", color: "#2196f3" },
          { data: oweData, label: "Total To Pay", color: "#e91e63" },
          { data: getData, label: "Total To Receive", color: "#4caf50" },
        ]}
        height={300}
        sx={{
          ".MuiChartsAxis-tickLabel": { fill: "none" },
          ".MuiChartsAxis-line": { stroke: "gray" },
          ".MuiChartsAxis-tick": { stroke: "none" },
        }}
      />
    </div>
  );
};

export default UserGroupExpenseCharts;
