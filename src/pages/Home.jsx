import { useEffect, useState } from "react";
import { Link, Outlet } from "react-router-dom";
import useUserProfile from "../hooks/useUserProfile";
import { useAuth } from "../context/AuthContext";
import "../css/pages/Home.css";
import EquiloNoteLoader from "../components/EquiloNoteLoader";
import SVGIcons from "../assets/icons/SVGIcons";
import MakeGroupModal from "../components/MakeGroupModal"; // ✅ keep this
// ❌ remove: import createGroup from "../firebase/utils/groupHandlers";

const Home = () => {
  const { currentUser } = useAuth();
  const { userData, loading, isOnline } = useUserProfile(currentUser?.uid);

  const [rotatePlus, setRotatePlus] = useState(false);
  const [showMakeGroupModal, setShowMakeGroupModal] = useState(false);

  const handlePlusClick = () => {
    setRotatePlus(true);
    setShowMakeGroupModal(true); // open modal
    setTimeout(() => setRotatePlus(false), 600);
  };

  return (
    <div className="home-layout">
      <aside className="sidebar">
        <div className="left-bar">
          <div className="animation">
            <EquiloNoteLoader />
          </div>
          <Link to={"/equilo/home"} className="link">
            Dashboard
          </Link>
          <Link to={"/equilo/home"} className="link">
            History
          </Link>

          <div className="group-container">
            <div>Groups</div>
            <div
              className={`plus-icon-wrapper ${rotatePlus ? "rotate" : ""}`}
              onClick={handlePlusClick}
            >
              <SVGIcons.plus className="plus-icon" />
            </div>
          </div>
          <hr className="group-devider" />
        </div>
      </aside>

      <MakeGroupModal
        isOpen={showMakeGroupModal}
        onClose={() => setShowMakeGroupModal(false)}
        currentUser={currentUser}
      />

      <main className="main-content-center">
        <Outlet />
      </main>

      <aside className="sidebar right-bar">
        <p className="hint">🔔 Notifications</p>
        <p className="hint">📊 Stats</p>
        <p className="hint">💬 Support</p>
      </aside>
    </div>
  );
};

export default Home;
