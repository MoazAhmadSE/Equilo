// Calculate equal shares for members marked as "paid" or "split"
export const calculateShares = (totalAmount, contributions, members) => {
  const total = parseFloat(totalAmount || 0);

  const included = contributions.filter(
    (c) => c.role === "paid" || c.role === "split"
  );

  const share = included.length ? total / included.length : 0;

  return members.map((m) => ({
    id: m.id,
    name: m.name,
    finalAmount: included.find((c) => c.id === m.id)
      ? parseFloat(share.toFixed(2))
      : 0,
    note: included.find((c) => c.id === m.id) ? "Included" : "Not Included",
  }));
};

// Determine who pays whom and how much
export const calculateSettlementMatrix = (contributions, shares, members) => {
  const paidMap = Object.fromEntries(
    contributions
      .filter((c) => c.role === "paid")
      .map((c) => [c.id, parseFloat(c.amount || 0)])
  );

  const balances = members.map((m) => {
    const paid = paidMap[m.id] || 0;
    const owed = shares.find((s) => s.id === m.id)?.finalAmount || 0;
    return { id: m.id, net: paid - owed };
  });

  const debtors = balances
    .filter((b) => b.net < -0.01)
    .sort((a, b) => a.net - b.net);
  const creditors = balances
    .filter((b) => b.net > 0.01)
    .sort((a, b) => b.net - a.net);

  const settlements = [];

  for (let debtor of debtors) {
    let debt = -debtor.net;

    for (let creditor of creditors) {
      if (debt <= 0) break;
      if (creditor.net <= 0 || creditor.id === debtor.id) continue;

      const pay = Math.min(debt, creditor.net);
      settlements.push({
        from: debtor.id,
        to: creditor.id,
        amount: parseFloat(pay.toFixed(2)),
      });

      debt -= pay;
      creditor.net -= pay;
    }
  }

  return settlements;
};

export const validateExpense = (desc, total, contributions, members) => {
  const totalFloat = parseFloat(total);

  if (!desc || isNaN(totalFloat) || totalFloat <= 0) {
    return "Please enter a valid description and total amount.";
  }

  for (const c of contributions) {
    if (c.role === "paid") {
      const amt = parseFloat(c.amount);
      if (isNaN(amt) || amt <= 0) {
        const name = members.find((m) => m.id === c.id)?.name || "Unknown";
        return `Invalid paid amount for ${name}`;
      }
    }
  }

  const hasSplitter = contributions.some(
    (c) => c.role === "split" || c.role === "paid"
  );
  if (!hasSplitter) {
    return "At least one member must be included in the split.";
  }

  // ✅ Don't block if paid total doesn't match
  return null;
};

// export const calculateShares = (totalAmount, contributions, members) => {
//   const total = parseFloat(totalAmount || 0);
//   const splitters = contributions.filter(
//     (c) => c.role === "split" || c.role === "paid"
//   );

//   const equalShare = splitters.length > 0 ? total / splitters.length : 0;

//   let fixedMembers = [];
//   let skippedAmount = 0;

//   splitters.forEach((s) => {
//     if (s.discountType === "custom-amount") {
//       const customAmt = Math.min(parseFloat(s.discountValue || 0), equalShare);
//       const reduction = equalShare - customAmt;

//       fixedMembers.push({
//         ...s,
//         finalAmount: customAmt,
//         note: "Custom Amount",
//       });

//       if (s.redistributeRemaining) {
//         skippedAmount += reduction;
//       }
//     }
//   });

//   splitters.forEach((s) => {
//     if (s.discountType === "give-discount") {
//       const discountPercent = Math.min(
//         Math.max(parseFloat(s.discountPercent || 0), 0),
//         100
//       );
//       const discountedShare = equalShare * (1 - discountPercent / 100);
//       const reduction = equalShare - discountedShare;

//       fixedMembers.push({
//         ...s,
//         finalAmount: discountedShare,
//         note: `Admin Discount (${discountPercent}%)`,
//       });

//       if (s.redistributeRemaining) {
//         skippedAmount += reduction;
//       }
//     }
//   });

//   const fixedIds = fixedMembers.map((f) => f.id);
//   const eligible = splitters.filter(
//     (s) => !fixedIds.includes(s.id) && s.redistributeRemaining
//   );

//   const perPersonRedistribution =
//     eligible.length > 0 ? skippedAmount / eligible.length : 0;

//   const redistributedMembers = eligible.map((s) => ({
//     ...s,
//     finalAmount: equalShare + perPersonRedistribution,
//     note: "Split + Redistributed",
//   }));

//   const silentFixed = splitters
//     .filter((s) => !fixedIds.includes(s.id) && !s.redistributeRemaining)
//     .map((s) => ({
//       ...s,
//       finalAmount: equalShare,
//       note: "Split (No Redistribution)",
//     }));

//   const combined = [...fixedMembers, ...redistributedMembers, ...silentFixed];

//   return members.map((m) => {
//     const found = combined.find((s) => s.id === m.id);
//     return {
//       id: m.id,
//       name: m.name,
//       finalAmount: found?.finalAmount || 0,
//       note: found?.note || "",
//     };
//   });
// };

// export const calculateSettlementMatrix = (contributions, shares, members) => {
//   const payers = contributions
//     .filter((c) => c.role === "paid")
//     .map((c) => ({ ...c, paid: parseFloat(c.amount || 0) }))
//     .filter((c) => c.paid > 0);

//   const balances = members.map((m) => {
//     const paid = payers.find((p) => p.id === m.id)?.paid || 0;
//     const owed = shares.find((s) => s.id === m.id)?.finalAmount || 0;
//     return { id: m.id, name: m.name, net: paid - owed };
//   });

//   const debtors = balances.filter((b) => b.net < 0);
//   const creditors = balances.filter((b) => b.net > 0);

//   const settlements = [];
//   let sortedDebtors = [...debtors].sort((a, b) => a.net - b.net);
//   let sortedCreditors = [...creditors].sort((a, b) => b.net - a.net);

//   for (let debtor of sortedDebtors) {
//     let debt = -debtor.net;

//     for (let creditor of sortedCreditors) {
//       if (debt === 0) break;
//       if (creditor.net === 0) continue;
//       if (debtor.id === creditor.id) continue;

//       const payAmount = Math.min(debt, creditor.net);

//       settlements.push({
//         from: debtor.id,
//         to: creditor.id,
//         amount: payAmount,
//       });

//       debt -= payAmount;
//       creditor.net -= payAmount;
//     }
//   }

//   return settlements;
// };

// export const validateExpense = (desc, total, contributions, members) => {
//   if (!desc || !total || isNaN(total) || parseFloat(total) <= 0) {
//     return "Please enter a valid description and total amount.";
//   }

//   for (const c of contributions) {
//     if (c.role === "paid") {
//       const amount = parseFloat(c.amount);
//       if (isNaN(amount) || amount <= 0) {
//         const name = members.find((m) => m.id === c.id)?.name || c.id;
//         return `Invalid paid amount for ${name}`;
//       }
//     }
//   }

//   return null;
// };
