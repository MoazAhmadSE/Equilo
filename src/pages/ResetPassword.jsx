import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { confirmPasswordReset, checkActionCode } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";
import { toast } from "react-toastify";
import "../css/pages/ResetPassword.css";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const [isPasswordEmpty, setIsPasswordEmpty] = useState(false);
  const [validPassword, setValidPassword] = useState(true);
  const [isConfirmPasswordEmpty, setIsConfirmPasswordEmpty] = useState(false);
  const [passwordDidMatch, setPasswordDidMatch] = useState(true);

  const oobCode = searchParams.get("oobCode");

  useEffect(() => {
    if (oobCode) {
      checkActionCode(auth, oobCode)
        .then((info) => setEmail(info.data.email))
        .catch(() => setError("Invalid-or-missing-reset-code"));
    } else {
      setError("No reset code found.");
    }
  }, [oobCode]);

  const handleSubmit = async () => {
    if (newPassword === "") return setIsPasswordEmpty(true);
    if (newPassword.length < 6) return setValidPassword(false);
    if (confirmPassword === "") return setIsConfirmPasswordEmpty(true);
    if (newPassword !== confirmPassword) return setPasswordDidMatch(false);

    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      toast.success("Password reset successfully!");
      navigate("/login");
    } catch (err) {
      setError(err.message || "Something went wrong.");
    }
  };

  return (
    <div className="reset-container">
      <div className="reset-card">
        <h2 className="reset-title">Reset Password</h2>
        <hr className="reset-divider" />

        {error === "Invalid-or-missing-reset-code" ? (
          <>
            <div className="reset-error">
              <p>Link is invalid or expired</p>
              <button
                className="reset-button"
                onClick={() => navigate("/login")}
              >
                Go to Login
              </button>
            </div>
          </>
        ) : (
          <>
            <input
              className="reset-input"
              type="email"
              value={email}
              readOnly
              placeholder="Email"
            />
            <input
              className={`reset-input ${
                !validPassword || isPasswordEmpty ? "invalid" : ""
              }`}
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value.trim());
                setValidPassword(true);
                setIsPasswordEmpty(false);
              }}
            />
            {!validPassword && (
              <p className="error-text">
                Password must be at least 6 characters long.
              </p>
            )}
            <input
              className={`reset-input ${
                !passwordDidMatch || isConfirmPasswordEmpty ? "invalid" : ""
              }`}
              type="password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value.trim());
                setPasswordDidMatch(true);
                setIsConfirmPasswordEmpty(false);
              }}
            />
            {!passwordDidMatch && (
              <p className="error-text">Passwords do not match.</p>
            )}

            <button className="reset-button" onClick={handleSubmit}>
              Reset Password
            </button>
          </>
        )}
      </div>
    </div>
  );
}
