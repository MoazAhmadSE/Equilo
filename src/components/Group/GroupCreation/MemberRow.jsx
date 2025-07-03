const MemberRow = ({ member, contribution, onChange }) => {
  const { id, name, email, isJoined } = member;
  const c = contribution;

  return (
    <div className={`member-row ${!isJoined ? "blurred" : ""}`}>
      <div className="member-info">
        <span>{name}</span>
        <span className="member-email">{email}</span>
      </div>

      <select
        value={c.role}
        onChange={(e) => onChange(id, "role", e.target.value)}
        disabled={!isJoined}
      >
        <option value="not-included">Not Included</option>
        <option value="paid">Paid</option>
        <option value="split">Split</option>
      </select>

      {c.role === "paid" && (
        <input
          type="text"
          placeholder="Amount Paid"
          value={c.amount}
          className="amount-input"
          onChange={(e) => onChange(id, "amount", e.target.value)}
        />
      )}
    </div>
  );
};

export default MemberRow;

// // components/partials/MemberRow.js
// import React from "react";

// const MemberRow = ({ member, contribution, onChange }) => {
//     const { id, name, email, isJoined } = member;
//     const c = contribution;

//     return (
//         <div className={`member-row ${!isJoined ? "blurred" : ""}`}>
//             <div className="member-info">
//                 <span>{name}</span>
//                 <span className="member-email">{email}</span>
//             </div>

//             <select
//                 value={c.role}
//                 onChange={(e) => onChange(id, "role", e.target.value)}
//                 disabled={!isJoined}
//             >
//                 <option value="not-included">Not Included</option>
//                 <option value="paid">Paid</option>
//                 <option value="split">Split</option>
//             </select>

//             {c.role === "paid" && (
//                 <input
//                     type="number"
//                     placeholder="Amount Paid"
//                     value={c.amount}
//                     className="amount-input"
//                     onChange={(e) => onChange(id, "amount", e.target.value)}
//                 />
//             )}

//             {c.role === "split" && (
//                 <div className="split-options">
//                     <select
//                         value={c.discountType}
//                         onChange={(e) => onChange(id, "discountType", e.target.value)}
//                     >
//                         <option value="none">No Discount</option>
//                         <option value="get-discount">Get Discount</option>
//                         <option value="give-discount">Give Discount</option>
//                         <option value="custom-amount">Custom Amount</option>
//                     </select>

//                     {c.discountType !== "none" && (
//                         <>
//                             <input
//                                 type="number"
//                                 placeholder={
//                                     c.discountType === "custom-amount"
//                                         ? "Custom Amount"
//                                         : "Discount Value"
//                                 }
//                                 className="amount-input"
//                                 value={c.discountValue}
//                                 onChange={(e) => onChange(id, "discountValue", e.target.value)}
//                             />

//                             <select
//                                 value={c.redistributeRemaining ? "true" : "false"}
//                                 onChange={(e) =>
//                                     onChange(id, "redistributeRemaining", e.target.value === "true")
//                                 }
//                             >
//                                 <option value="true">Redistribute Remaining</option>
//                                 <option value="false">Don't Redistribute</option>
//                             </select>
//                         </>
//                     )}
//                 </div>
//             )}
//         </div>
//     );
// };

// export default MemberRow;
