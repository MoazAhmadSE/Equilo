import { useCallback } from "react";
import {
    doc,
    updateDoc,
    serverTimestamp,
    deleteDoc,
    getDoc,
    setDoc,
    collection,
} from "firebase/firestore";
import { toast } from "react-toastify";
import { db } from "../../firebase/firebaseConfig";
import { sendPaymentNotification } from "../../utils/sendGroupDeletionNotifications";

const useGroupPayment = (user, fetchGroup) => {
    const handlePay = useCallback(async ({ to, amount, expenseId, groupId }) => {
        try {
            const expenseRef = doc(db, "expenses", expenseId);
            const expenseSnap = await getDoc(expenseRef);

            if (!expenseSnap.exists()) {
                toast.error("Expense not found.");
                return;
            }

            const expenseData = expenseSnap.data();
            const settlementPlan = expenseData.settlementPlan || [];
            const expenseTitle = expenseData.title || "Expense";

            const fromUserId = user.uid;
            const toUserId = to;

            const updatedSettlementPlan = settlementPlan.filter(
                (entry) =>
                    !(
                        entry.fromUserId === fromUserId &&
                        entry.toUserId === toUserId &&
                        entry.amount === amount
                    )
            );

            await updateDoc(expenseRef, {
                settlementPlan: updatedSettlementPlan,
                updatedAt: serverTimestamp(),
            });

            const balanceId = `${expenseId}_${fromUserId}_${toUserId}`;
            await deleteDoc(doc(db, "balances", balanceId));

            const paymentRef = doc(collection(db, "payments"));
            await setDoc(paymentRef, {
                from: fromUserId,
                to: toUserId,
                amount,
                groupId,
                expenseId,
                timestamp: serverTimestamp(),
            });

            const [toUserSnap, fromUserSnap, groupSnap] = await Promise.all([
                getDoc(doc(db, "users", toUserId)),
                getDoc(doc(db, "users", fromUserId)),
                getDoc(doc(db, "groups", groupId)),
            ]);

            const toData = toUserSnap.data();
            const fromData = fromUserSnap.data();
            const groupDataDoc = groupSnap.data();

            const recipientEmail = toData.userEmail || toData.email;

            if (!recipientEmail) {
                toast.error("Recipient email missing.");
                return;
            }

            await sendPaymentNotification({
                to_email: recipientEmail,
                receiverName: toData.fullName || toData.userName || "Member",
                senderName: fromData.fullName || fromData.userName || "Someone",
                groupName: groupDataDoc.name || groupDataDoc.groupName || "Group",
                amount,
                expenseTitle,
                groupId,
            });

            toast.success("Payment completed.");
            fetchGroup?.();
        } catch (err) {
            console.error("❌ handlePay error:", err.message);
            toast.error("Payment failed.");
        }
    }, [user, fetchGroup]);

    return { handlePay };
};

export default useGroupPayment;