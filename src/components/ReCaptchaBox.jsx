import ReCAPTCHA from "react-google-recaptcha";
import "../css/components/ReCaptchaBox.css";

const SITE_KEY = "6LdF-GYrAAAAAGM4on1Iyn0h9W6BSK9UTi4zIAKM";

export default function ReCaptchaBox({ recaptchaRef, setIsCaptchaValid }) {

  return (
    <div className="recaptcha-wrapper">
      <ReCAPTCHA
        sitekey={SITE_KEY}
        ref={recaptchaRef}
        onChange={(value) => setIsCaptchaValid(!!value)}
      />
    </div>
  );
}
