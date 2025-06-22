import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../css/pages/ResetPassword.css";
import { useNavigate } from "react-router-dom";
import { useResetPassword } from "../hooks/useResetPassword";

export default function ResetPassword() {
  const navigate = useNavigate();
  const {
    email,
    newPassword,
    confirmPassword,
    error,
    isPasswordEmpty,
    validPassword,
    isConfirmPasswordEmpty,
    passwordDidMatch,
    isLoading,
    setNewPassword,
    setConfirmPassword,
    handleSubmit,
  } = useResetPassword();

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="reset-container">
        <div className="reset-card">
          <h2 className="reset-title">Reset Password</h2>
          <hr className="reset-divider" />

          {error === "Invalid-or-missing-reset-code" ? (
            <div className="reset-error">
              <p>Link is invalid or expired</p>
              <button
                className="reset-button"
                onClick={() => navigate("/login")}
              >
                Go to Login
              </button>
            </div>
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
                  isPasswordEmpty || !validPassword ? "invalid" : ""
                }`}
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value.trim());
                }}
              />
              {!validPassword && (
                <p className="error-text">
                  Password must be at least 6 characters long.
                </p>
              )}

              <input
                className={`reset-input ${
                  isConfirmPasswordEmpty || !passwordDidMatch ? "invalid" : ""
                }`}
                type="password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value.trim());
                }}
              />
              {!passwordDidMatch && (
                <p className="error-text">Passwords do not match.</p>
              )}

              <button
                className="reset-button"
                onClick={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? "Resetting..." : "Reset Password"}
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
