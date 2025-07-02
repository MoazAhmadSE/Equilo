import { doc, setDoc, serverTimestamp, getDoc, writeBatch, WriteBatch, arrayUnion, collection, increment } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { toast } from "react-toastify";
import { sendInviatationMail } from "../../utils/sendMail";

export async function createNewUser({ user }) {
    if (!user?.uid) return 'User Data not present.';

    const userRef = doc(db, "users", user.uid);
    const snapshot = await getDoc(userRef);

    if (!snapshot.exists()) {
        const createUserBatch = writeBatch(db);
        createUserBatch.set(userRef, {
            userName: user.displayName || "New User",
            userEmail: user.email,
            userCreatedAt: serverTimestamp(),
            userJoinedGroupIds: [],
            userNotificationsIds: [],
            userStats: {
                totalSpend: 0,
                totalToPay: 0,
                totalToGet: 0
            }
        });
        try {
            await createUserBatch.commit();
            return 'User Created Successfully';
        } catch (error) {
            return error;
        }
    }
}

export async function createGroup({ group }) {
    if (!group) return "Group Data not Present.";

    const groupMembersStats = {
        [group.groupCreatedBy]: {
            totalSpend: 0,
            totalToPay: 0,
            totalToGet: 0,
        },
    };

    const groupId = doc(collection(db, "groups")).id;
    const groupRef = doc(db, "groups", groupId);
    const createGroupBatch = writeBatch(db);

    createGroupBatch.set(groupRef, {
        groupName: group.groupName,
        groupDiscription: group.groupDiscription,
        groupCreatedBy: group.groupCreatedBy,
        groupCreatedAt: group.groupCreatedAt,
        groupMembers: group.groupMembers,
        groupMembersStats: groupMembersStats,
        groupExpenseIds: []
    });

    try {
        await sendInviatationMail(group.groupMembers, group.groupCreatedBy, group.groupName, groupId);
        await inviteNotifications(groupId, group.groupName, group.groupMembers, group.groupCreatedBy);
        await createGroupBatch.commit();
        return 'Group Created Successfully';
    } catch (error) {
        return error;
    }
}

export async function createExpense(groupId, expenseData, PaymentPlan) {
    if (!groupId || !expenseData) return 'GroupId or Expense Data not Present.';

    const expenseId = doc(collection(db, "groups", groupId, "expenses")).id;
    const expenseRef = doc(db, "groups", groupId, "expenses", expenseId);
    const createExpenseBatch = writeBatch(db);

    createExpenseBatch.set(expenseRef, {
        expenseTitle: expenseData.expenseTitle,
        expenseDescription: expenseData.expenseDescription,
        expenseTotalAmount: expenseData.expenseTotalAmount,
        expensePaidBy: expenseData.expensePaidBy,
        expenseSplitBetween: expenseData.expenseSplitBetween,
        usersExpensePayments: {
            duePayments: [],
            completedPayments: []
        },
        expenseCreatedAt: serverTimestamp(),
    });

    try {
        await Promise.all(
            PaymentPlan.map((payment) =>
                createPayment(groupId, expenseId, payment)
            )
        );
        await updateGroupToAddExpenseId(groupId, expenseId);
        await createExpenseBatch.commit();
        return expenseId;
    } catch (error) {
        return error;
    }
}

export async function createPayment(groupId, expenseId, paymentData) {
    const paymentId = doc(collection(db, "groups", groupId, "expenses", expenseId, "Payments")).id;
    const paymentRef = doc(db, "groups", groupId, "expenses", expenseId, "Payments", paymentId);
    const updateExpenseRef = doc(db, "groups", groupId, "expenses", expenseId);
    const createPaymentBatch = writeBatch(db);

    createPaymentBatch.set(paymentRef, {
        paymentFrom: paymentData.paymentFrom, // user who owes money
        paymentTo: paymentData.paymentTo,  // user who paid
        paymentAmount: paymentData.paymentAmount,
        paymentCreatedAt: serverTimestamp()
    });

    createPaymentBatch.update(updateExpenseRef, {
        'usersExpensePayments.duePayments': arrayUnion(paymentId)
    });

    try {
        await createPaymentBatch.commit();
        return `Successfully created payment for ${paymentData.paymentFrom} of ${paymentData.paymentAmount}`;
    } catch (error) {
        return error;
    }
}

export async function updateGroupToAddExpenseId(groupId, expenseId) {
    if (!groupId || !expenseId) return 'GroupId or ExpenseId is Missing.';

    const groupRef = doc(db, "groups", groupId);
    const updateGroupToAddExpenseIdBatch = writeBatch(db);

    updateGroupToAddExpenseIdBatch.update(groupRef, {
        groupExpenseIds: arrayUnion(expenseId)
    })

    try {
        await updateGroupToAddExpenseIdBatch.commit();
        return 'Sucessfull Added the Expense Id in Group.';
    } catch (error) {
        return error;
    }
}

export async function updateUserandGroupMemberStats(groupId, paymentData) {
    const [paymentFrom, paymentTo, paymentAmount] = paymentData;

    if (!groupId || !paymentFrom || !paymentTo || !paymentAmount) {
        return "Missing data for stat update.";
    }

    if (paymentFrom === paymentTo) return;

    const batch = writeBatch(db);

    const userFromRef = doc(db, "users", paymentFrom);
    batch.update(userFromRef, {
        "userStats.totalToPay": increment(paymentAmount)
    });

    const groupRef = doc(db, "groups", groupId);
    batch.update(groupRef, {
        [`groupMembersStats.${paymentFrom}.totalToPay`]: increment(paymentAmount),
        [`groupMembersStats.${paymentTo}.totalToGet`]: increment(paymentAmount),
        [`groupMembersStats.${paymentTo}.totalSpend`]: increment(paymentAmount)
    });

    const userToRef = doc(db, "users", paymentTo);
    batch.update(userToRef, {
        "userStats.totalToGet": increment(paymentAmount),
        "userStats.totalSpend": increment(paymentAmount)
    });

    try {
        await batch.commit();
        return "User and group member stats updated Successfully.";
    } catch (error) {
        return error;
    }
}

export async function inviteNotifications(groupId, groupName, groupMembers, groupCreatedBy) {
    if (!groupId || !groupName || !groupMembers || !groupCreatedBy) return;

    const inviterRef = doc(db, "users", groupCreatedBy);
    const inviterSnap = await getDoc(inviterRef);
    if (!inviterSnap.exists()) return "Inviter not found.";
    const inviterName = inviterSnap.data().userName || "Someone";

    const inviteNotificationsBatch = writeBatch(db);
    groupMembers.forEach((member) => {
        if (member === groupCreatedBy) return;
        const notificationId = doc(collection(db, "notifications")).id;
        const notificationRef = doc(db, "notifications", notificationId);
        inviteNotificationsBatch.set(notificationRef, {
            notificationType: 'group-invite',
            notificationTo: member,
            notificationData: `You are invited by ${inviterName} to join ${groupName}`,
            notificationInviteLink: `/group/${groupId}`,
            notificationCreatedAt: serverTimestamp()
        })
    })

    try {
        await inviteNotificationsBatch.commit();
        return 'Successfully send all the notificatios to group members';
    } catch (error) {
        return error;
    }
}
