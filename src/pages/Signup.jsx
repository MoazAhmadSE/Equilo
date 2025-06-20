import "../css/pages/Signup.css";
import Input from "../components/Input";
import SVGIcons from "../assets/icons/SVGIcons";
import { Link } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import useSignup from "../hooks/useSignup";
import useRecaptcha from "../hooks/useRecaptcha";
import ReCaptchaBox from "../components/ReCaptchaBox";

const Signup = () => {
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
    handleGoogleSignup,
  } = useSignup();

  const {
    recaptchaRef,
    isCaptchaValid,
    setIsCaptchaValid,
    getToken,
    resetCaptcha,
  } = useRecaptcha();

  return (
    <div className="signup-container">
      <ToastContainer position="top-right" autoClose={3000} />
      <h1 className="signup-heading">Sign Up</h1>

      <div className="signup-input-group">
        <Input
          placeholder="Full Name"
          className="input"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        {errors.name && <div className="error-text">{errors.name}</div>}

        <Input
          placeholder="Email"
          className="input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {errors.email && <div className="error-text">{errors.email}</div>}

        <Input
          placeholder="Password"
          className="input"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {errors.password && <div className="error-text">{errors.password}</div>}

        <Input
          placeholder="Confirm Password"
          className="input"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
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
        disabled={loading}
        onClick={() => handleSignup(isCaptchaValid, getToken, resetCaptcha)}
      >
        {loading ? "Signing Up..." : "Sign Up"}
      </button>

      <div className="divider-container">
        <hr className="hr-line" />
        <span className="hr-text">OR</span>
        <hr className="hr-line" />
      </div>

      <button
        className="btn-google"
        onClick={handleGoogleSignup}
        disabled={loading}
      >
        <SVGIcons.google />
        {loading ? "Signing in..." : "Sign up with Google"}
      </button>

      <div className="signup-footer">
        <span>Already have an account?</span>
        <Link to="/login" className="signup-link">
          Login
        </Link>
      </div>
    </div>
  );
};

export default Signup;
