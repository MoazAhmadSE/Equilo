import ReCAPTCHA from "react-google-recaptcha";
import "../css/components/ReCaptchaBox.css";
import useTheme from "../hooks/useTheme";

const SITE_KEY = "6LdF-GYrAAAAAGM4on1Iyn0h9W6BSK9UTi4zIAKM";

export default function ReCaptchaBox({ recaptchaRef, setIsCaptchaValid }) {
  const { theme } = useTheme();

  return (
    <div className="recaptcha-wrapper">
      <ReCAPTCHA
        key={theme}
        sitekey={SITE_KEY}
        ref={recaptchaRef}
        onChange={(value) => setIsCaptchaValid(!!value)}
        theme={theme === "dark" ? "dark" : "light"}
      />
    </div>
  );
}
