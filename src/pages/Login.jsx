import Input from "../components/Input";
import SVGIcons from "../assets/icons/SVGIcons";
import { Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import useLogin from "../hooks/useLogin";
import useRecaptcha from "../hooks/useRecaptcha";
import ReCaptchaBox from "../components/ReCaptchaBox";
import { useState } from "react";
import { useResetPassword } from "../firebase/auth/useResetPassword";
import FormInput from "../components/FormInput";
import "../css/pages/Login.css";

const Login = () => {
  const [googleLoading, setGoogleLoading] = useState(false);
  const { resetPassword, error, isSuccess } = useResetPassword();

  const {
    email,
    password,
    errors,
    loading,
    setEmail,
    setPassword,
    handleLogin,
    focusRef,
    handleGoogleLogin: originalGoogleLogin,
    handleForgetPassword,
  } = useLogin();

  const {
    recaptchaRef,
    isCaptchaValid,
    setIsCaptchaValid,
    getToken,
    resetCaptcha,
  } = useRecaptcha();

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    await originalGoogleLogin();
    setGoogleLoading(false);
  };

  const isWorking = loading || googleLoading;

  return (
    <div className="login-container">
      <ToastContainer position="top-right" autoClose={3000} />

      <h1 className="login-heading">Login</h1>

      {isWorking ? (
        <div className="login-loader">
          <div className="logo-wrapper">
            <div className="logo">
              <SVGIcons.logo width="50" height="50" />
            </div>
            <p className="loader-text">
              {loading ? "Logging You In..." : "Logging In with Google..."}
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="login-input-group">
            <FormInput
              name="email"
              placeholder="Email"
              type="email"
              value={email}
              onChange={(val) => setEmail(val.replace(/\s/g, "").toLowerCase())}
              focusRef={focusRef}
              error={errors.email}
            />

            <FormInput
              name="password"
              placeholder="Password"
              type="password"
              value={password}
              onChange={(val) => setPassword(val.replace(/\s/g, ""))}
              focusRef={focusRef}
              error={errors.password}
            />

            <div
              className="forgot-password-container"
              onClick={handleForgetPassword(resetPassword)}
            >
              Forgot Password?
            </div>

            {error && (
              <div className="reset-message error">
                Error: Try Again {console.log(error)}
              </div>
            )}
            {isSuccess && (
              <div className="reset-message success">
                A password reset email has been sent!
              </div>
            )}

            <ReCaptchaBox
              recaptchaRef={recaptchaRef}
              setIsCaptchaValid={setIsCaptchaValid}
            />

            <button
              className="btn login-btn"
              disabled={loading || googleLoading}
              onClick={() => {
                handleLogin(isCaptchaValid, getToken, resetCaptcha);
              }}
            >
              Login
            </button>
          </div>

          <div className="divider-container">
            <hr className="hr-line" />
            <span className="hr-text">OR</span>
            <hr className="hr-line" />
          </div>

          <button
            className="btn-google"
            onClick={handleGoogleLogin}
            disabled={loading || googleLoading}
          >
            <SVGIcons.google />
            Login with Google
          </button>

          <div className="login-footer">
            <span>Don't have an account?</span>
            <Link to="/signup" className="signup-link">
              Sign Up
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

export default Login;
