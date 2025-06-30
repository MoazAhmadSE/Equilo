// src/utils/sendExpenseNotifications.js
import emailjs from "@emailjs/browser";

const SERVICE_ID = "service_2f8zvft";
const TEMPLATE_ID = "template_84n8cxj";
const PUBLIC_KEY = "YIdWslct_842CYmQh";

export const sendExpenseNotifications = async ({
    members,
    groupName,
    expenseTitle,
    totalAmount,
    addedByName,
    calculatedShares,
    settlementPlan,
    groupId,
}) => {
    const baseUrl = "http://localhost:5173";

    for (const member of members) {
        if (!member.isJoined || !member.email) continue;

        const memberName = member.name?.trim().toLowerCase() || "";
        const share = calculatedShares.find((s) => s.id === member.id);
        const personalNote = share?.note || "";
        const personalAmount = share ? share?.finalAmount?.toFixed(2) : "0.00";

        const personalSettlements = settlementPlan
            .filter(
                (s) =>
                    s.from?.trim().toLowerCase() === memberName ||
                    s.to?.trim().toLowerCase() === memberName
            )
            .map(
                (s) =>
                    `${s.from} pays ${s.to}: Rs. ${parseFloat(s?.amount).toFixed(2)}`
            )
            .join("\n") || "No settlements involving you.";

        const message = `
Hi ${member.name || "Member"},

A new expense "${expenseTitle}" (Total: Rs. ${totalAmount}) was added in the group "${groupName}" by ${addedByName}.

Your Share: Rs. ${personalAmount} ${personalNote ? `(${personalNote})` : ""}
  
Settlement Info:
${personalSettlements}

You can view the group here:
${baseUrl}/equilo/home/group/${groupId}

– Equilo Team
`;

        const templateParams = {
            to_email: member.email,
            group_name: groupName,
            deleter: addedByName,
            message,
            subject: `New Expense in "${groupName}": ${expenseTitle}`,
        };

        try {
            await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);
            console.log(`📧 Sent expense notification to ${member.email}`);
        } catch (error) {
            console.error(`❌ Failed to send email to ${member.email}:`, error);
        }

        // Optional delay for rate limiting, e.g. 200ms
        await new Promise((res) => setTimeout(res, 200));
    }
};
