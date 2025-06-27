import { useState } from "react";
import useUserProfile from "../firebase/utils/useUserProfile";
import {
  doc,
  getDoc,
  query,
  collection,
  getDocs,
  where,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import "../css/pages/Dashboard.css";

import GreetingSection from "../components/Dashboard/DecryptedText";
import ChartByGroup from "../components/Dashboard/ChartByGroup";

const Dashboard = () => {
  const { userData, loading } = useUserProfile();
  const [exporting, setExporting] = useState(false);

  if (loading || !userData) return null;

  const groupIds = userData.joinedGroupIds || [];

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const uid = userData.userId;

      const userSnap = await getDoc(doc(db, "users", uid));
      const profile = userSnap.exists() ? userSnap.data() : {};

      const rows = [];

      const [receivedMoneySnap, sentMoneySnap, currentExpensesSnap] =
        await Promise.all([
          getDocs(
            query(collection(db, "payments"), where("fromUserId", "==", uid))
          ),
          getDocs(
            query(collection(db, "payments"), where("toUserId", "==", uid))
          ),
          getDocs(query(collection(db, "expenses"))),
        ]);

      const payments = [
        ...receivedMoneySnap.docs.map((d) => d.data()),
        ...sentMoneySnap.docs.map((d) => d.data()),
      ];

      const expenses = currentExpensesSnap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      rows.push(["Profile"]);
      rows.push(["Field", "Value"]);
      Object.entries(profile).forEach(([key, value]) => {
        rows.push([key, JSON.stringify(value)]);
      });

      rows.push([]);

      rows.push(["Payments"]);
      rows.push([
        "expenseId",
        "groupId",
        "fromUserId",
        "toUserId",
        "amountPaid",
        "method",
      ]);
      payments.forEach((p) => {
        rows.push([
          p.expenseId || "",
          p.groupId || "",
          p.fromUserId || "",
          p.toUserId || "",
          p.amountPaid || "",
          p.method || "",
        ]);
      });

      rows.push([]);

      rows.push(["Expenses"]);
      rows.push([
        "id",
        "groupId",
        "description",
        "totalAmount",
        "contributions",
        "shares",
        "settlementPlan",
      ]);
      expenses.forEach((exp) => {
        rows.push([
          exp.id || "",
          exp.groupId || "",
          exp.description || "",
          exp.totalAmount || "",
          JSON.stringify(exp.contributions || []),
          JSON.stringify(exp.calculatedShares || []),
          JSON.stringify(exp.settlementPlan || []),
        ]);
      });

      const csvContent = rows.map((r) => r.join(",")).join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `equilo_${userData.userName}_${new Date()
        .toISOString()
        .replace(/[:.]/g, "-")}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("CSV Export failed:", err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="dashboard-container">
      <GreetingSection
        userName={userData.userName}
        onExport={handleExportCSV}
        exporting={exporting}
      />
      <ChartByGroup groupIds={groupIds} />
    </div>
  );
};

export default Dashboard;
