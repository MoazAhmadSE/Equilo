import "../../css/pages/Dashboard.css";
import GrettingText from "./GrettingText";

const GreetingSection = ({ userName, onExport, exporting }) => {
  return (
    <div className="greeting-section">
      <h1 className="greeting-title">
        <GrettingText
          text={`Welcome, ${userName || "Friend"}!`}
          animateOn="view"
          speed={80}
          maxIterations={30}
          revealDirection="start"
          characters="ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!@#"
          className="revealed"
          encryptedClassName="encrypted"
          parentClassName="decrypted-wrapper"
        />
      </h1>
      <p className="greeting-paragraph">
        <GrettingText
          text="We're glad to have you back on Equilo."
          animateOn="view"
          speed={80}
          maxIterations={30}
          revealDirection="start"
          characters="ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!@#"
          className="revealed"
          encryptedClassName="encrypted"
          parentClassName="decrypted-wrapper"
        />
      </p>
      <button
        disabled={exporting}
        onClick={onExport}
        className={`export-button ${exporting ? "disabled" : ""}`}
      >
        {exporting ? "Exporting…" : "Download Full Data (CSV)"}
      </button>
    </div>
  );
};

export default GreetingSection;
