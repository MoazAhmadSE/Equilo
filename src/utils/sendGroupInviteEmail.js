// src/utils/emailService.js
import emailjs from '@emailjs/browser';

const SERVICE_ID = 'service_2f8zvft';
const TEMPLATE_ID = 'template_2u6v8q9';
const PUBLIC_KEY = 'YIdWslct_842CYmQh';

const sendGroupInviteEmail = async ({ to_email, inviter, group_name, invite_link }) => {
  const templateParams = {
    to_email,
    inviter,
    group_name,
    invite_link,
  };

  try {
    const response = await emailjs.send(
      SERVICE_ID,
      TEMPLATE_ID,
      templateParams,
      PUBLIC_KEY
    );
    return { success: true, response };
  } catch (error) {
    console.error('EmailJS Error:', error);
    return { success: false, error };
  }
};
export default sendGroupInviteEmail;