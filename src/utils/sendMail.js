import emailjs from "@emailjs/browser";

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

const invitationTemplete = ({ toEmail, inviter, groupName, groupId }) => {
    const para = {
        toEmail,
        inviter,
        groupName,
        invite_link: `http://localhost:5173/equilo/home/group/join/${groupId}`
    }
    return {
        SERVICE_ID,
        TEMPLATE_ID,
        para,
        PUBLIC_KEY
    }

}

export async function sendInviatationMail({ groupMembers, groupCreatedBy, groupName, groupId }) {
    try {
        await Promise.all(
            groupMembers.map(async (memberId) => {
                await emailjs.send(
                    await invitationTemplete(memberId, groupCreatedBy, groupName, groupId)
                )
                console.log("Sucessfully Sent Invitation Mail to: ", memberId);
            })
        )
        return 'Sucessfully Sent Invitation Mail to Members';
    } catch (error) {
        return error;
    }
}

