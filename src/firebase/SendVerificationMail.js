import { sendEmailVerification } from "firebase/auth";


const SendVerificationMail = async (user) => {
    const actionCodeSettings = {
        url: `http://localhost:5173/verifyemail`,
        handleCodeInApp: true,
    };
    await sendEmailVerification(user, actionCodeSettings);
}
export default SendVerificationMail;