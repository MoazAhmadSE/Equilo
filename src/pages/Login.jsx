import "../css/pages/Login.css";
import Input from "../components/Input";
import SVGIcons from "../assets/icons/SVGIcons";
import { Link } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import useRecaptcha from "../hooks/useRecaptcha";
import ReCaptchaBox from "../components/ReCaptchaBox";
import useLogin from "../hooks/useLogin";
import CircularLoader from "../components/CircularLoader";

const Login = () => {
  const {
    userEmail,
    userPassword,
    isEmpty,
    isInvalidEmail,
    isPasswordEmpty,
    signinError,
    loading,
    setUserEmail,
    setUserPassword,
    setIsEmpty,
    setIsInvalidEmail,
    setIsPasswordEmpty,
    setSignInError,
    handleLogin,
    handleGoogleLogin,
  } = useLogin();

  const {
    recaptchaRef,
    isCaptchaValid,
    setIsCaptchaValid,
    getToken,
    resetCaptcha,
  } = useRecaptcha();

  return (
    <div className="login-container">
      <ToastContainer position="top-right" autoClose={3000} />

      <h1 className="login-heading">Login</h1>

      <div className="input-group">
        <Input
          placeholder="Enter Your Email"
          className="input"
          value={userEmail}
          onChange={(e) => {
            setUserEmail(e.target.value);
            setIsEmpty(false);
            setIsInvalidEmail(false);
            setSignInError(false);
          }}
        />
        {isEmpty && <div className="error-text">Email is required.</div>}
        {isInvalidEmail && (
          <div className="error-text">Invalid email address.</div>
        )}

        <Input
          placeholder="Enter Your Password"
          className="input"
          type="password"
          value={userPassword}
          onChange={(e) => {
            setUserPassword(e.target.value);
            setIsPasswordEmpty(false);
            setSignInError(false);
          }}
        />
        {isPasswordEmpty && (
          <div className="error-text">Password is required.</div>
        )}

        {signinError && (
          <div className="error-text">
            Invalid credentials. Please try again.
          </div>
        )}

        <ReCaptchaBox
          recaptchaRef={recaptchaRef}
          setIsCaptchaValid={setIsCaptchaValid}
        />
      </div>

      <button
        className="btn login-btn"
        disabled={loading}
        onClick={() => handleLogin(isCaptchaValid, getToken, resetCaptcha)}
      >
        {loading ? (
          <>
            "Logging in..."
            <CircularLoader />
          </>
        ) : (
          "Login"
        )}
      </button>

      <div className="divider-container">
        <hr className="hr-line" />
        <span className="hr-text">OR</span>
        <hr className="hr-line" />
      </div>

      <button
        className="btn-google"
        onClick={handleGoogleLogin}
        disabled={loading}
      >
        <SVGIcons.google />
        {loading ? "Loading..." : "Login with Google"}
      </button>

      <div className="signup-footer">
        <span>Don't have an account?</span>
        <Link to="/signup" className="signup-link">
          Sign Up
        </Link>
      </div>
    </div>
  );
};

export default Login;
