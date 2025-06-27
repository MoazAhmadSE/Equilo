import { Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import useUserGroups from "../hooks/home/useUserGroups";
import useNotifications from "../hooks/home/useNotifications";
import MakeGroupModal from "../components/home/MakeGroupModal";
import NotificationPanel from "../components/home/NotificationPanel";
import cleanupInviteNotification from "../firebase/utils/cleanupInviteNotification";
import SidebarLeft from "../components/home/SidebarLeft";
import "../css/pages/Home.css";

const Home = () => {
  const { user } = useAuth();
  const [showMakeGroupModal, setShowMakeGroupModal] = useState(false);

  const navigate = useNavigate();
  const notifications = useNotifications(user);
  const userGroups = useUserGroups(user);

  const toggleMakeGroupModal = () => {
    setShowMakeGroupModal((prev) => !prev);
  };

  return (
    <div className="home-layout">
      <SidebarLeft
        groups={userGroups}
        handleCreateGroupModal={toggleMakeGroupModal}
      />

      {showMakeGroupModal && (
        <MakeGroupModal
          handleCreateGroupModal={toggleMakeGroupModal}
          user={user}
        />
      )}

      <main className="main-content-center">
        <Outlet />
      </main>

      <NotificationPanel
        notifications={notifications}
        onClickNotification={(link) => navigate(link)}
        onDeleteNotification={(id) => cleanupInviteNotification(id, user?.uid)}
      />
    </div>
  );
};

export default Home;
