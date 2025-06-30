import {
    doc,
    collection,
    writeBatch,
    serverTimestamp,
    increment,
    arrayUnion,
} from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";

export const addGroupExpense = async ({
    groupId,
    description,
    totalAmount,
    contributions,
    calculatedShares,
    settlementPlan,
    createdBy,
}) => {
    const expenseId = doc(collection(db, "expenses")).id;
    const batch = writeBatch(db);

    const expenseRef = doc(db, "expenses", expenseId);
    const formattedSettlementPlan = [];

    for (const settlement of settlementPlan) {
        const { from: fromUserId, to: toUserId, amount } = settlement;

        if (amount <= 0) continue;

        formattedSettlementPlan.push({
            fromUserId,
            toUserId,
            amount,
        });

        const balanceDocId = `${expenseId}_${fromUserId}_${toUserId}`;
        const balanceRef = doc(db, "balances", balanceDocId);

        batch.set(
            balanceRef,
            {
                groupId,
                expenseId,
                fromUserId,
                toUserId,
                amount: increment(amount),
                updatedAt: serverTimestamp(),
            },
            { merge: true }
        );
        // console.log(fromUserId, toUserId, amount);
    }

    batch.set(expenseRef, {
        expenseId,
        title: description,
        totalAmount,
        contributions,
        calculatedShares,
        settlementPlan: formattedSettlementPlan,
        createdBy,
        createdAt: serverTimestamp(),
    });

    const groupRef = doc(db, "groups", groupId);
    batch.update(groupRef, {
        expenseIds: arrayUnion(expenseId),
    });

    try {
        await batch.commit();
        console.log(`✅ Expense ${expenseId} added and balances updated`);
        return { success: true, expenseId };
    } catch (error) {
        console.error("❌ Failed to add expense:", error);
        return { success: false, error };
    }
};
