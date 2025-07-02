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
import FormInput from "../components/FormInput";

const Signup = () => {
  const [googleLoading, setGoogleLoading] = useState(false);
  const {
    values,
    errors,
    loading,
    setField,
    handleSignup,
    focusRef,
    handleGoogleSignup: signInWithGoogle,
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
    await signInWithGoogle();
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
            <FormInput
              name="userName"
              placeholder="Full Name"
              value={values.userName}
              error={errors.userName}
              onChange={setField}
              focusRef={focusRef}
            />

            <FormInput
              name="userMail"
              placeholder="Email"
              type="email"
              value={values.userMail}
              error={errors.userMail}
              onChange={setField}
              focusRef={focusRef}
            />

            <FormInput
              name="userPassword"
              placeholder="Password"
              type="password"
              value={values.userPassword}
              error={errors.userPassword}
              onChange={setField}
              focusRef={focusRef}
            />

            <FormInput
              name="confirmUserPassword"
              placeholder="Confirm Password"
              type="password"
              value={values.confirmUserPassword}
              error={errors.confirmUserPassword}
              onChange={setField}
              focusRef={focusRef}
            />
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
            disabled={loading || googleLoading}
            onClick={handleGoogleSignup}
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
