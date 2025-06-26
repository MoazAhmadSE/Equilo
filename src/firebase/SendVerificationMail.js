import { sendEmailVerification } from "firebase/auth";

const SendVerificationMail = async (user) => {
  const actionCodeSettings = {
    url: "http://localhost:5173",
    handleCodeInApp: true,
  };

  try {
    await sendEmailVerification(user, actionCodeSettings);
  } catch (error) {
    console.error("Failed to send verification email:", error);
    throw error;
  }
};

export default SendVerificationMail;
