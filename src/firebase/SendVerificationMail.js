import { sendEmailVerification } from "firebase/auth";

const SendVerificationMail = async (user) => {
  const actionCodeSettings = {
    url: `${import.meta.env.VITE_BASE_URL || "http://localhost:5173"}/verifyemail`,
    handleCodeInApp: true,
  };

  try {
    await sendEmailVerification(user, actionCodeSettings);
    console.log("Verification email sent.");
  } catch (err) {
    console.error("Failed to send verification email:", err);
    if (err.code === "auth/too-many-requests") {
      throw new Error("Too many requests. Please wait and try again.");
    } else {
      throw new Error("Could not send verification email. Please try again.");
    }
  }
};


export default SendVerificationMail;
