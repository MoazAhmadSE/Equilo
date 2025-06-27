export const calculateShares = (totalAmount, contributions, members) => {
  const total = parseFloat(totalAmount || 0);
  const splitters = contributions.filter(
    (c) => c.role === "split" || c.role === "paid"
  );

  const equalShare = splitters.length > 0 ? total / splitters.length : 0;

  let fixedMembers = [];
  let skippedAmount = 0;

  splitters.forEach((s) => {
    if (s.discountType === "custom-amount") {
      const customAmt = Math.min(parseFloat(s.discountValue || 0), equalShare);
      const reduction = equalShare - customAmt;

      fixedMembers.push({
        ...s,
        finalAmount: customAmt,
        note: "Custom Amount",
      });

      if (s.redistributeRemaining) {
        skippedAmount += reduction;
      }
    }
  });

  splitters.forEach((s) => {
    if (s.discountType === "give-discount") {
      const discountPercent = Math.min(parseFloat(s.discountValue || 0), 100);
      const discountedShare = equalShare * (1 - discountPercent / 100);
      const reduction = equalShare - discountedShare;

      fixedMembers.push({
        ...s,
        finalAmount: discountedShare,
        note: `Admin Discount (${discountPercent}%)`,
      });

      if (s.redistributeRemaining) {
        skippedAmount += reduction;
      }
    }
  });

  const fixedIds = fixedMembers.map((f) => f.id);
  const eligible = splitters.filter(
    (s) => !fixedIds.includes(s.id) && s.redistributeRemaining
  );

  const perPersonRedistribution =
    eligible.length > 0 ? skippedAmount / eligible.length : 0;

  const redistributedMembers = eligible.map((s) => ({
    ...s,
    finalAmount: equalShare + perPersonRedistribution,
    note: "Split + Redistributed",
  }));

  const silentFixed = splitters
    .filter((s) => !fixedIds.includes(s.id) && !s.redistributeRemaining)
    .map((s) => ({
      ...s,
      finalAmount: equalShare,
      note: "Split (No Redistribution)",
    }));

  const combined = [...fixedMembers, ...redistributedMembers, ...silentFixed];

  return members.map((m) => {
    const found = combined.find((s) => s.id === m.id);
    return {
      id: m.id,
      name: m.name,
      finalAmount: found?.finalAmount || 0,
      note: found?.note || "",
    };
  });
};

export const calculateSettlementMatrix = (contributions, shares, members) => {
  const payers = contributions
    .filter((c) => c.role === "paid")
    .map((c) => ({ ...c, paid: parseFloat(c.amount || 0) }))
    .filter((c) => c.paid > 0);

  const balances = members.map((m) => {
    const paid = payers.find((p) => p.id === m.id)?.paid || 0;
    const owed = shares.find((s) => s.id === m.id)?.finalAmount || 0;
    return { id: m.id, name: m.name, net: paid - owed };
  });

  const debtors = balances.filter((b) => b.net < 0);
  const creditors = balances.filter((b) => b.net > 0);

  const settlements = [];
  let sortedDebtors = [...debtors].sort((a, b) => a.net - b.net);
  let sortedCreditors = [...creditors].sort((a, b) => b.net - a.net);

  for (let debtor of sortedDebtors) {
    let debt = -debtor.net;

    for (let creditor of sortedCreditors) {
      if (debt === 0) break;
      if (creditor.net === 0) continue;
      if (debtor.id === creditor.id) continue;

      const payAmount = Math.min(debt, creditor.net);

      settlements.push({
        from: debtor.id,
        to: creditor.id,
        amount: payAmount,
      });

      debt -= payAmount;
      creditor.net -= payAmount;
    }
  }

  return settlements;
};

export const validateExpense = (desc, total, contributions, members) => {
  if (!desc || !total || isNaN(total) || parseFloat(total) <= 0) {
    return "Please enter a valid description and total amount.";
  }

  for (const c of contributions) {
    if (c.role === "paid") {
      const amount = parseFloat(c.amount);
      if (isNaN(amount) || amount <= 0) {
        const name = members.find((m) => m.id === c.id)?.name || c.id;
        return `Invalid paid amount for ${name}`;
      }
    }
  }

  return null;
};
