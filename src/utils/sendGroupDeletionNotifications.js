// src/utils/sendGroupDeletionNotifications.js

import emailjs from '@emailjs/browser';

const SERVICE_ID = 'service_2f8zvft';
const TEMPLATE_ID = 'template_84n8cxj';
const PUBLIC_KEY = 'YIdWslct_842CYmQh';

// 📩 For full group deletion
export const sendGroupDeletionEmail = async ({ to_email, group_name, deleter }) => {
    const subject = `Group "${group_name}" Deleted by ${deleter} on Equilo`;

    const templateParams = {
        to_email,
        group_name,
        deleter,
        message: `The group "${group_name}" has been permanently deleted by ${deleter}.`,
        subject,
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
        console.error('EmailJS Deletion Email Error:', error);
        return { success: false, error };
    }
};

// 📩 For individual member removal
export const sendMemberRemovalEmail = async ({ to_email, group_name, deleter }) => {
    const subject = `You Were Removed from "${group_name}" on Equilo`;

    const templateParams = {
        to_email,
        group_name,
        deleter,
        message: `You have been removed from the group "${group_name}" by ${deleter}.`,
        subject,
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
        console.error('EmailJS Member Removal Email Error:', error);
        return { success: false, error };
    }
};
