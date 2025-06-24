import { useAuth } from "../context/AuthContext";
import useUserProfile from "../hooks/useUserProfile";
import DecryptedText from "../components/GrettingText";
import "../css/pages/Dashboard.css";

const Dashboard = () => {
  const { user } = useAuth();
  const { userData, loading } = useUserProfile();

  if (loading || !userData) return null;

  return (
    <div className="dashboard-container">
      <div className="greeting-section">
        <h1 className="greeting-title">
          <DecryptedText
            text={`Welcome, ${userData.userName || "Friend"}!`}
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
          <DecryptedText
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
      </div>
    </div>
  );
};

export default Dashboard;
