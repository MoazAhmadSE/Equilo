// import React, { useEffect, useState } from "react";
// import { doc, getDoc } from "firebase/firestore";
// import { db } from "../firebase/firebaseConfig";
// import { useAuth } from "../context/AuthContext";
// import { PieChart } from "@mui/x-charts/PieChart";

// const UserExpensePieChart = ({ pieData, title }) => {
//   if (!pieData.length) return <p>No data to display for {title}.</p>;

//   return (
//     <>
//       <h3>{title}</h3>
//       <PieChart
//         series={[
//           {
//             data: pieData.map(({ id, value, label }) => ({
//               id,
//               value,
//               label,
//               tooltip: `${label}\nAmount: ${value.toFixed(2)}`,
//             })),
//           },
//         ]}
//         width={300}
//         height={300}
//         slotProps={{
//           tooltip: {
//             children: ({ item }) => (
//               <div style={{ padding: 6 }}>
//                 <strong>{item.label}</strong>
//                 <div>{item.tooltip}</div>
//               </div>
//             ),
//           },
//         }}
//       />
//     </>
//   );
// };

// const buildExpenseData = (expenses, user) => {
//   const identifiers = [user.uid, user.email];

//   // Three datasets
//   const paidData = [];
//   const oweData = [];
//   const getData = [];

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

//     if (paidAmount > 0) {
//       paidData.push({ id: idx, value: paidAmount, label });
//     }
//     if (balance < 0) {
//       // User owes money
//       oweData.push({ id: idx, value: Math.abs(balance), label });
//     }
//     if (balance > 0) {
//       // User should get money
//       getData.push({ id: idx, value: balance, label });
//     }
//   });

//   return { paidData, oweData, getData };
// };

// export default function GroupUserExpenseCharts({ groupId }) {
//   const { user } = useAuth();
//   const [expenses, setExpenses] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [statusMessage, setStatusMessage] = useState("");

//   useEffect(() => {
//     if (!groupId) {
//       setStatusMessage("Waiting for group ID...");
//       return;
//     }

//     if (!user?.uid) {
//       setStatusMessage("Waiting for user authentication...");
//       return;
//     }

//     const fetchExpenses = async () => {
//       try {
//         setLoading(true);
//         setStatusMessage("Fetching group document...");

//         const groupRef = doc(db, "groups", groupId);
//         const groupSnap = await getDoc(groupRef);

//         if (!groupSnap.exists()) {
//           setStatusMessage("Group not found.");
//           setLoading(false);
//           return;
//         }

//         const groupData = groupSnap.data();
//         const expenseIds = groupData.expenseIds || [];

//         if (expenseIds.length === 0) {
//           setStatusMessage("No expenses found in this group.");
//           setExpenses([]);
//           setLoading(false);
//           return;
//         }

//         setStatusMessage(`Fetching ${expenseIds.length} expenses...`);

//         const fetchedExpenses = [];
//         for (const expenseId of expenseIds) {
//           const expenseRef = doc(db, "expenses", expenseId);
//           const expenseSnap = await getDoc(expenseRef);
//           if (expenseSnap.exists()) {
//             fetchedExpenses.push(expenseSnap.data());
//           }
//         }

//         setExpenses(fetchedExpenses);
//         setStatusMessage("Expenses fetched.");
//       } catch (error) {
//         setStatusMessage(`Error: ${error.message}`);
//         console.error(error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchExpenses();
//   }, [groupId, user?.uid]);

//   const { paidData, oweData, getData } = buildExpenseData(expenses, user);

//   return (
//     <div>
//       {loading && <p>Loading... {statusMessage}</p>}
//       {!loading && (
//         <>
//           <UserExpensePieChart pieData={paidData} title="Total Spent by You" />
//           <UserExpensePieChart
//             pieData={oweData}
//             title="Total You Have to Pay"
//           />
//           <UserExpensePieChart
//             pieData={getData}
//             title="Total You Have to Get"
//           />
//           {statusMessage && !expenses.length && <p>Status: {statusMessage}</p>}
//         </>
//       )}
//     </div>
//   );
// }
import React, { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { useAuth } from "../context/AuthContext";
import { BarChart } from "@mui/x-charts/BarChart";

const UserExpenseBarChart = ({ barData, title }) => {
  if (!barData.length) return <p>No data to display for {title}.</p>;

  return (
    <>
      <h3>{title}</h3>
      <BarChart
        series={[
          {
            data: barData.map(({ value }) => value),
            label: title,
          },
        ]}
        xAxis={[
          {
            scaleType: "band", // <-- Important fix for bar chart
            data: barData.map(({ label }) => label),
          },
        ]}
        width={600}
        height={300}
        slotProps={{
          tooltip: {
            children: ({ item }) => (
              <div style={{ padding: 6 }}>
                <strong>{barData[item.index].label}</strong>
                <div>Amount: {barData[item.index].value.toFixed(2)}</div>
              </div>
            ),
          },
        }}
      />
    </>
  );
};

const buildExpenseData = (expenses, user) => {
  const identifiers = [user.uid, user.email];

  const paidData = [];
  const oweData = [];
  const getData = [];

  expenses.forEach((exp, idx) => {
    const paidEntry = exp.contributions?.find((p) =>
      identifiers.includes(p.id)
    );
    const shareEntry = exp.calculatedShares?.find((s) =>
      identifiers.includes(s.id)
    );

    const paidAmount = paidEntry ? parseFloat(paidEntry.amount || 0) : 0;
    const shareAmount = shareEntry
      ? parseFloat(shareEntry.finalAmount || 0)
      : 0;
    const balance = paidAmount - shareAmount;

    const label = exp.title || exp.description || `Expense ${idx + 1}`;

    if (paidAmount > 0) {
      paidData.push({ id: idx, value: paidAmount, label });
    }
    if (balance < 0) {
      oweData.push({ id: idx, value: Math.abs(balance), label });
    }
    if (balance > 0) {
      getData.push({ id: idx, value: balance, label });
    }
  });

  return { paidData, oweData, getData };
};

export default function GroupUserExpenseCharts({ groupId }) {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    if (!groupId) {
      setStatusMessage("Waiting for group ID...");
      return;
    }

    if (!user?.uid) {
      setStatusMessage("Waiting for user authentication...");
      return;
    }

    const fetchExpenses = async () => {
      try {
        setLoading(true);
        setStatusMessage("Fetching group document...");

        const groupRef = doc(db, "groups", groupId);
        const groupSnap = await getDoc(groupRef);

        if (!groupSnap.exists()) {
          setStatusMessage("Group not found.");
          setLoading(false);
          return;
        }

        const groupData = groupSnap.data();
        const expenseIds = groupData.expenseIds || [];

        if (expenseIds.length === 0) {
          setStatusMessage("No expenses found in this group.");
          setExpenses([]);
          setLoading(false);
          return;
        }

        setStatusMessage(`Fetching ${expenseIds.length} expenses...`);

        const fetchedExpenses = [];
        for (const expenseId of expenseIds) {
          const expenseRef = doc(db, "expenses", expenseId);
          const expenseSnap = await getDoc(expenseRef);
          if (expenseSnap.exists()) {
            fetchedExpenses.push(expenseSnap.data());
          }
        }

        setExpenses(fetchedExpenses);
        setStatusMessage("Expenses fetched.");
      } catch (error) {
        setStatusMessage(`Error: ${error.message}`);
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchExpenses();
  }, [groupId, user?.uid]);

  const { paidData, oweData, getData } = buildExpenseData(expenses, user);

  return (
    <div>
      {loading && <p>Loading... {statusMessage}</p>}
      {!loading && (
        <>
          <UserExpenseBarChart barData={paidData} title="Total Spent by You" />
          <UserExpenseBarChart
            barData={oweData}
            title="Total You Have to Pay"
          />
          <UserExpenseBarChart
            barData={getData}
            title="Total You Have to Get"
          />
          {statusMessage && !expenses.length && <p>Status: {statusMessage}</p>}
        </>
      )}
    </div>
  );
}
