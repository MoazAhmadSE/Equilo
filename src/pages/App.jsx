import { Outlet } from "react-router-dom";
import ToggleTheme from "../components/ToggleTheme";
import constants from "../assets/constants/static.json";
import "../css/pages/App.css";
import SVGIcons from "../assets/icons/SVGIcons";
import { useAuth } from "../context/AuthContext";
import useUserProfile from "../hooks/useUserProfile";
import { useState } from "react";

const App = () => {
  const { currentUser, logout } = useAuth();
  const { userData, loading, isOnline } = useUserProfile(currentUser?.uid);
  const [showDropdown, setShowDropdown] = useState(false);

  const toggleDropdown = (show) => {
    setShowDropdown(show);
  };

  return (
    <>
      <header className="navbar-container">
        <div className="navbar">
          <div className="logo">
            <SVGIcons.logo />
          </div>

          <div className="app-name">{constants.appName}</div>

          <div className="toggle-userinfo">
            <ToggleTheme />
            {currentUser && !loading && userData && (
              <div
                className="user-wrapper"
                onMouseEnter={() => toggleDropdown(true)}
                onMouseLeave={() => toggleDropdown(false)}
              >
                <img
                  src={userData.userImage || "/default-avatar.png"}
                  alt="Profile"
                  className="user-avatar"
                />
                <span className="user-name">{userData.userName}</span>
                <span className="user-status">{isOnline ? "🟢" : "🔴"}</span>

                {showDropdown && (
                  <div className="user-dropdown">
                    <div className="dropdown-item bold">{userData.userName}</div>
                    <div className="dropdown-item email">{userData.userEmail}</div>
                    <hr />
                    <button className="dropdown-item" onClick={() => alert("Redirect to Change Password Page")}>
                      🔐 Change Password
                    </button>
                    <button className="dropdown-item logout" onClick={logout}>
                      🚪 Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="main-content">
        <Outlet />
      </main>
    </>
  );
};

export default App;
