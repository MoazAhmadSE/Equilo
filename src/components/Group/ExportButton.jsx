import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import "../../css/pages/Group.css";

const ExportButton = ({
  user,
  groupData,
  groupId,
  resolvedMembers,
  expenses,
}) => {
  const handleExportGroupData = async () => {
    try {
      const uid = user.uid;
      const myEmail = user.mail;
      const isAdmin = uid === groupData.createdBy;

      const rows = [];

      rows.push(["Expenses"]);
      rows.push([
        "Expense Title",
        "Total Amount",
        "User Name",
        "User ID",
        "Contribution Amount",
        "Share Amount",
      ]);

      console.log(expenses);
      for (const exp of expenses) {
        console.log("🎯", exp.title, exp.contributions, exp.calculatedShares);
        const contribs = exp.contributions || [];
        const shares = exp.calculatedShares || [];

        const relevantIds = isAdmin
          ? [
              ...new Set([
                ...contribs.map((c) => c.id),
                ...shares.map((s) => s.id),
              ]),
            ]
          : [uid, myEmail];

        for (const id of relevantIds) {
          const contribution = contribs.find((c) => `${c.id}` === `${id}`);
          const share = shares.find((s) => `${s.id}` === `${id}`);

          if (contribution || share) {
            rows.push([
              exp.title || "Untitled",
              exp.totalAmount || 0,
              resolvedMembers.find((m) => m.id === id)?.name || id,
              id,
              contribution?.amount || 0,
              share?.amount || 0,
            ]);
          }
        }
      }

      rows.push([""]);

      rows.push(["Payments"]);
      rows.push(["From", "To", "Amount", "Method", "Expense ID"]);

      const q1 = query(
        collection(db, "payments"),
        where("groupId", "==", groupId)
      );
      const snap = await getDocs(q1);
      const allPayments = snap.docs.map((d) => d.data());
      console.log(snap.docs);

      const payments = isAdmin
        ? allPayments
        : allPayments.filter((p) => p.fromUserId === uid || p.toUserId === uid);

      for (const p of payments) {
        rows.push([
          resolvedMembers.find((m) => m.id === p.fromUserId)?.name ||
            p.fromUserId,
          resolvedMembers.find((m) => m.id === p.toUserId)?.name || p.toUserId,
          p.amountPaid || 0,
          p.method || "N/A",
          p.expenseId || "-",
        ]);
      }

      const csv = rows.map((r) => r.join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${isAdmin ? "group" : "my"}_data_${
        groupData.groupName
      }.csv`;
      a.click();
      console.log("📄 CSV Content:\n", csv);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export failed:", err);
    }
  };

  return (
    <button
      onClick={handleExportGroupData}
      className="export-group-csv-file-button"
    >
      ⬇️ Export {user?.uid === groupData.createdBy ? "Full Group" : "My"} Data
      (CSV)
    </button>
  );
};

export default ExportButton;
