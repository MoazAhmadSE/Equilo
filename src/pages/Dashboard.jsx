import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import useUserProfile from "../firebase/utils/useUserProfile";
import DecryptedText from "../components/GrettingText";
import UserGroupExpenseCharts from "../components/GroupUserExpenseCharts";
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

const Dashboard = () => {
  const { user } = useAuth();
  const { userData, loading } = useUserProfile();
  const [exporting, setExporting] = useState(false);

  if (loading || !userData) return null;
  const groupIds = userData.joinedGroupIds || [];
  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const uid = user.uid;

      // Fetch user profile
      const userSnap = await getDoc(doc(db, "users", uid));
      const profile = userSnap.exists() ? userSnap.data() : {};

      // Fetch payments
      const pay1 = await getDocs(
        query(collection(db, "payments"), where("fromUserId", "==", uid))
      );
      const pay2 = await getDocs(
        query(collection(db, "payments"), where("toUserId", "==", uid))
      );
      const payments = [
        ...pay1.docs.map((d) => d.data()),
        ...pay2.docs.map((d) => d.data()),
      ];

      // Fetch expenses
      const expensesSnap = await getDocs(collection(db, "expenses"));
      const expenses = expensesSnap.docs
        .map((d) => d.data())
        .filter((exp) => {
          const ids = [uid, profile.userEmail];
          const inContrib = exp.contributions?.some((c) => ids.includes(c.id));
          const inShare = exp.calculatedShares?.some((s) => ids.includes(s.id));
          return inContrib || inShare;
        });

      // Build CSV content
      const rows = [];

      // Profile Section
      rows.push(["Profile"]);
      rows.push(["Field", "Value"]);
      Object.entries(profile).forEach(([key, value]) => {
        rows.push([key, JSON.stringify(value)]);
      });

      rows.push([""]); // Empty line

      // Payments Section
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

      rows.push([""]); // Empty line

      // Expenses Section
      rows.push(["Expenses"]);
      rows.push([
        "id",
        "groupId",
        "description",
        "totalAmount",
        "contributions",
        "shares",
      ]);
      expenses.forEach((exp) => {
        rows.push([
          exp.id || "",
          exp.groupId || "",
          exp.description || "",
          exp.totalAmount || "",
          JSON.stringify(exp.contributions || []),
          JSON.stringify(exp.calculatedShares || []),
        ]);
      });

      // Convert rows to CSV and download
      const csvContent = rows.map((r) => r.join(",")).join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "equilo_full_export.csv";
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
      <div className="greeting-section">
        <h1 className="greeting-title">
          <DecryptedText
            text={`Welcome, ${userData.userName || "Friend"}!`}
            animateOn="view"
            speed={80}
            maxIterations={30}
            revealDirection="start"
            characters="ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!@#"
            className="revealed"
            encryptedClassName="encrypted"
            parentClassName="decrypted-wrapper"
          />
        </h1>
        <p className="greeting-paragraph">
          <DecryptedText
            text="We're glad to have you back on Equilo."
            animateOn="view"
            speed={80}
            maxIterations={30}
            revealDirection="start"
            characters="ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!@#"
            className="revealed"
            encryptedClassName="encrypted"
            parentClassName="decrypted-wrapper"
          />
        </p>
        <button
          disabled={exporting}
          onClick={handleExportCSV}
          style={{
            marginTop: "1rem",
            padding: "8px 16px",
            background: "var(--primary)",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: exporting ? "not-allowed" : "pointer",
          }}
        >
          {exporting ? "Exporting…" : "Download Full Data (CSV)"}
        </button>
      </div>

      <div className="charts-section">
        <h2 style={{ color: "var(--primary)", marginTop: "2rem" }}>
          Your Group Activity
        </h2>
        {groupIds.length === 0 ? (
          <p style={{ color: "var(--text)" }}>
            You're not part of any groups yet.
          </p>
        ) : (
          <UserGroupExpenseCharts />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
