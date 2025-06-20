import useEmailVerification from "../hooks/useEmailVerification";
import EquiloNoteLoader from "../components/EquiloNoteLoader";
import "../css/pages/VerifyEmail.css";
export default function VerifyEmail() {
  const { checking, resendVerification, loading } = useEmailVerification();

  return (
    <div className="verify-container">
      <div className="verify-card">
        {loading ? (
          <>
            <h2 className="verify-heading">Please wait verifying...</h2>
            <div className="verify-loader">
              <EquiloNoteLoader />
            </div>
          </>
        ) : (
          <>
            <h2 className="verify-heading">Please verify your email address</h2>
            <p className="verify-message">
              Check your inbox and click the verification link.
            </p>
            <button
              onClick={resendVerification}
              disabled={checking || loading}
              className="verify-button"
            >
              {checking ? "Resending..." : "Resend Email"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
