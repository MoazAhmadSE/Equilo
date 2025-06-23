import {
    collection,
    doc,
    writeBatch,
    serverTimestamp,
    increment,
} from "firebase/firestore";
import { db } from "../firebaseConfig";

export const addGroupExpense = async ({
    groupId,
    title,
    amount,
    paidBy,
    splitBetween,
    notes = "",
}) => {
    const expenseId = doc(collection(db, "groups", groupId, "expenses")).id;
    const batch = writeBatch(db);
    const eachShare = amount / splitBetween.length;

    const expenseRef = doc(db, "groups", groupId, "expenses", expenseId);
    batch.set(expenseRef, {
        expenseId,
        title,
        amount,
        paidBy,
        splitBetween,
        notes,
        createdAt: serverTimestamp(),
    });

    // Update balances
    splitBetween.forEach((memberId) => {
        if (memberId === paidBy) return;
        const balanceRef = doc(db, "groups", groupId, "balances", `${paidBy}_${memberId}`);
        batch.set(
            balanceRef,
            {
                from: paidBy,
                to: memberId,
                amount: increment(eachShare),
            },
            { merge: true }
        );
    });

    try {
        await batch.commit();
        console.log("✅ Expense recorded and balances updated");
    } catch (err) {
        console.error("❌ Failed to add expense:", err);
    }
};
