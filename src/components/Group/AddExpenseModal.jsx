import React, { useState, useMemo } from "react";
import MemberRow from "./GroupCreation/MemberRow";
import SharePreview from "./GroupCreation/SharePreview";
import SettlementPreview from "./GroupCreation/SettlementPreview";
import {
  calculateShares,
  calculateSettlementMatrix,
  validateExpense,
} from "./GroupCreation/expenseCalculations";

import { addGroupExpense } from "../../firebase/utils/expenseHandlers";
import "../../css/components/AddExpenseModal.css";

const AddExpenseModal = ({
  isOpen,
  onClose,
  groupId,
  onAdd,
  members = [],
  currentUserId,
}) => {
  const [description, setDescription] = useState("");
  const [totalAmount, setTotalAmount] = useState("");

  const [contributions, setContributions] = useState(
    members.map((m) => ({
      id: m.id,
      role: "not-included", // can be "paid", "split", or "not-included"
      amount: "", // used only if role === "paid"
    }))
  );

  const handleChange = (id, field, value) => {
    setContributions((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  const calculatedShares = useMemo(
    () => calculateShares(totalAmount, contributions, members),
    [totalAmount, contributions]
  );

  const settlementPlan = useMemo(
    () => calculateSettlementMatrix(contributions, calculatedShares, members),
    [contributions, calculatedShares]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    const error = validateExpense(
      description,
      totalAmount,
      contributions,
      members
    );

    if (error) {
      alert(error);
      return;
    }

    const expenseData = {
      description,
      totalAmount: parseFloat(totalAmount),
      contributions,
      calculatedShares,
      settlementPlan,
      groupId,
      createdBy: currentUserId,
    };

    try {
      await addGroupExpense(expenseData);
      onAdd?.(expenseData);
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to add expense.");
    }
  };

  if (!isOpen || !currentUserId) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h3>Add New Expense</h3>
        <form onSubmit={handleSubmit}>
          <div className="row-inputs">
            <input
              type="text"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
            <input
              type="number"
              placeholder="Total Amount"
              value={totalAmount}
              onChange={(e) => setTotalAmount(e.target.value)}
              required
            />
          </div>

          <div className="expense-section">
            <label>Member Contributions</label>
            <div className="member-list">
              {members.map((m) => (
                <MemberRow
                  key={m.id}
                  member={m}
                  contribution={contributions.find((x) => x.id === m.id)}
                  onChange={handleChange}
                />
              ))}
            </div>
          </div>

          <SharePreview shares={calculatedShares} />
          <SettlementPreview settlement={settlementPlan} members={members} />

          <div className="footer-buttons">
            <button type="submit" className="btn-primary">
              Add Expense
            </button>
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddExpenseModal;

// import React, { useState, useMemo } from "react";
// import MemberRow from "./GroupCreation/MemberRow";
// import SharePreview from "./GroupCreation/SharePreview";
// import SettlementPreview from "./GroupCreation/SettlementPreview";
// import {
//   calculateShares,
//   calculateSettlementMatrix,
//   validateExpense,
// } from "./GroupCreation/expenseCalculations";

// import { addGroupExpense } from "../../firebase/utils/expenseHandlers";
// import "../../css/components/AddExpenseModal.css";

// const AddExpenseModal = ({
//   isOpen,
//   onClose,
//   groupId,
//   onAdd,
//   members = [],
//   currentUserId,
//   currentUserName,
//   groupName,
// }) => {
//   const [description, setDescription] = useState("");
//   const [totalAmount, setTotalAmount] = useState("");
//   const [contributions, setContributions] = useState(
//     members.map((m) => ({
//       id: m.id,
//       role: "not-included",
//       amount: "",
//     }))
//   );

//   const handleChange = (id, field, value) => {
//     setContributions((prev) =>
//       prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
//     );
//   };

//   const calculatedShares = useMemo(
//     () => calculateShares(totalAmount, contributions, members),
//     [totalAmount, contributions]
//   );

//   const settlementPlan = useMemo(
//     () => calculateSettlementMatrix(contributions, calculatedShares, members),
//     [contributions, calculatedShares]
//   );

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     const error = validateExpense(
//       description,
//       totalAmount,
//       contributions,
//       members
//     );
//     if (error) {
//       alert(error);
//       return;
//     }

//     const expenseData = {
//       description,
//       totalAmount: parseFloat(totalAmount),
//       contributions,
//       calculatedShares,
//       settlementPlan,
//       groupId,
//       createdBy: currentUserId,
//     };

//     try {
//       await addGroupExpense(expenseData);
//       onAdd?.(expenseData);
//       onClose();
//     } catch (err) {
//       console.error(err);
//       alert("Failed to add expense.");
//     }
//   };

//   if (!isOpen || !currentUserId) return null;

//   return (
//     <div className="modal-backdrop">
//       <div className="modal-content">
//         <h3>Add New Expense</h3>
//         <form onSubmit={handleSubmit}>
//           <div className="row-inputs">
//             <input
//               type="text"
//               placeholder="Description"
//               value={description}
//               onChange={(e) => setDescription(e.target.value)}
//               required
//             />
//             <input
//               type="number"
//               placeholder="Total Amount"
//               value={totalAmount}
//               onChange={(e) => setTotalAmount(e.target.value)}
//               required
//             />
//           </div>

//           <div className="expense-section">
//             <label>Member Contributions</label>
//             <div className="member-list">
//               {members.map((m) => (
//                 <MemberRow
//                   key={m.id}
//                   member={m}
//                   contribution={contributions.find((x) => x.id === m.id)}
//                   onChange={handleChange}
//                 />
//               ))}
//             </div>
//           </div>

//           <SharePreview shares={calculatedShares} />
//           <SettlementPreview settlement={settlementPlan} members={members} />

//           <div className="footer-buttons">
//             <button type="submit" className="btn-primary">
//               Add Expense
//             </button>
//             <button type="button" className="btn-secondary" onClick={onClose}>
//               Cancel
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default AddExpenseModal;
