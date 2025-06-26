import "../css/pages/Signup.css";
import Input from "../components/Input";
import SVGIcons from "../assets/icons/SVGIcons";
import { Link } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import useSignup from "../hooks/useSignup";
import useRecaptcha from "../hooks/useRecaptcha";
import ReCaptchaBox from "../components/ReCaptchaBox";
import { useState } from "react";

const Signup = () => {
  const [googleLoading, setGoogleLoading] = useState(false);

  const {
    name,
    email,
    password,
    confirmPassword,
    errors,
    loading,
    setName,
    setEmail,
    setPassword,
    setConfirmPassword,
    handleSignup,
    focusRef,
    handleGoogleSignup: originalGoogleSignup,
  } = useSignup();

  const {
    recaptchaRef,
    isCaptchaValid,
    setIsCaptchaValid,
    getToken,
    resetCaptcha,
  } = useRecaptcha();

  const handleGoogleSignup = async () => {
    setGoogleLoading(true);
    await originalGoogleSignup();
    setGoogleLoading(false);
  };

  return (
    <div className="signup-container">
      <ToastContainer position="top-right" autoClose={3000} />
      <h1 className="signup-heading">Sign Up</h1>

      {loading || googleLoading ? (
        <div className="signup-loader">
          <div className="logo-wrapper">
            <div className="logo">
              <SVGIcons.logo width="50" height="50" />
            </div>
            <p className="loader-text">
              {loading
                ? "Signing You Up... Please Wait"
                : "Signing You Up with Google..."}
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="signup-input-group">
            <Input
              placeholder="Full Name"
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              ref={(el) => (focusRef.current.userName = el)}
              // aria-label="Full Name"
            />
            {errors.name && <div className="error-text">{errors.name}</div>}

            <Input
              placeholder="Email"
              className="input"
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value.replace(/\s/g, "").toLowerCase())
              }
              ref={(el) => (focusRef.current.userMail = el)}
              // aria-label="Email"
            />
            {errors.email && <div className="error-text">{errors.email}</div>}

            <Input
              placeholder="Password"
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value.replace(/\s/g, ""))}
              ref={(el) => (focusRef.current.userPassword = el)}
              // aria-label="Password"
            />
            {errors.password && (
              <div className="error-text">{errors.password}</div>
            )}

            <Input
              placeholder="Confirm Password"
              className="input"
              type="password"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(e.target.value.replace(/\s/g, ""))
              }
              ref={(el) => (focusRef.current.confirmUserPassword = el)}
              // aria-label="Confirm Password"
            />
            {errors.confirmPassword && (
              <div className="error-text">{errors.confirmPassword}</div>
            )}

            <ReCaptchaBox
              recaptchaRef={recaptchaRef}
              setIsCaptchaValid={setIsCaptchaValid}
            />
          </div>

          <button
            className="btn signup-btn"
            disabled={loading || googleLoading}
            onClick={() => handleSignup(isCaptchaValid, getToken, resetCaptcha)}
          >
            Sign Up
          </button>

          <div className="divider-container">
            <hr className="hr-line" />
            <span className="hr-text">OR</span>
            <hr className="hr-line" />
          </div>

          <button
            className="btn-google"
            onClick={handleGoogleSignup}
            disabled={loading || googleLoading}
          >
            <SVGIcons.google />
            Sign up with Google
          </button>

          <div className="signup-footer">
            <span>Already have an account?</span>
            <Link to="/login" className="signup-link">
              Login
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

export default Signup;
