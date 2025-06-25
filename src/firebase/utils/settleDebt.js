// firebase/utils/settleDebt.js
import { doc, increment, writeBatch, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

export const settleDebt = async ({ groupId, fromUserId, toUserId, amount }) => {
    const balanceDocId = `${groupId}_${fromUserId}_${toUserId}`;
    const balanceRef = doc(db, "balances", balanceDocId);

    const batch = writeBatch(db);
    batch.set(balanceRef, {
        groupId,
        fromUserId,
        toUserId,
        updatedAt: serverTimestamp(),
    }, { merge: true });

    batch.update(balanceRef, {
        amount: increment(-amount),
    });

    try {
        await batch.commit();
        console.log(`✅ Debt settled: ${amount} from ${fromUserId} to ${toUserId}`);
        return true;
    } catch (err) {
        console.error("❌ Failed to settle debt:", err);
        return false;
    }
};
