// src/firebase/utils/expenseHandlers.js

import {
    doc,
    collection,
    writeBatch,
    serverTimestamp,
    increment,
    arrayUnion,
} from "firebase/firestore";
import { db } from "../firebaseConfig";

/**
 * Add expense globally and link to group, update balances in top-level 'balances' collection.
 */
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

        // ✅ Use the already extracted UIDs directly
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
                expenseId, // 👈 ADD THIS LINE
                fromUserId,
                toUserId,
                amount: increment(amount),
                updatedAt: serverTimestamp(),
            },
            { merge: true }
        );
        console.log(fromUserId, toUserId, amount);
    }



    // Store expense in Firestore
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

    // Link expense to group
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
