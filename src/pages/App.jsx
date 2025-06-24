import { Outlet, useNavigate } from "react-router-dom";
import ToggleTheme from "../components/ToggleTheme";
import constants from "../assets/constants/static.json";
import "../css/pages/App.css";
import SVGIcons from "../assets/icons/SVGIcons";
import { useAuth } from "../context/AuthContext";
import useUserProfile from "../hooks/useUserProfile";
import { useEffect, useState } from "react";
import { useStringToColor } from "../hooks/useStringToColor";
import useFirestoreNetworkManager from "../hooks/useFirestoreNetworkManager";

const App = () => {
  const { user, logoutUser } = useAuth();
  const { userData, loading } = useUserProfile();
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  console.log("currentUser", user, "loading", loading, "userData", userData);

  const toggleDropdown = (show) => {
    setShowDropdown(show);
  };
  console.log("showDropdown", userData);

  const isOnline = useFirestoreNetworkManager();

  const avatarColor = useStringToColor(
    userData?.userName || userData?.userEmail
  );

  // useEffect(() => {
  //   if (loading) return; // Wait for auth check

  //   if (user && user.emailVerified) {
  //     navigate("/equilo/home", { replace: true });
  //   } else {
  //     navigate("/login", { replace: true });
  //   }
  // }, [user, loading, navigate]);

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
            {user && !loading && userData && (
              <div
                className="user-wrapper"
                onMouseEnter={() => toggleDropdown(true)}
                onMouseLeave={() => toggleDropdown(false)}
              >
                <div className="avatar-outer">
                  <div className="avatar-inner">
                    <div className="user-initials">
                      <span
                        className="avatar-content"
                        style={{ backgroundColor: avatarColor }}
                      >
                        {userData.userName
                          ? userData.userName[0].toUpperCase()
                          : userData.userEmail?.[0]?.toUpperCase() || "?"}
                      </span>
                    </div>
                  </div>
                  <div
                    className={`avatar-rotating-border ${
                      isOnline ? "online" : "offline"
                    }`}
                  ></div>
                </div>

                {showDropdown && (
                  <div className="user-dropdown">
                    <div className="dropdown-item bold">
                      {userData.userName}
                    </div>
                    <div className="dropdown-item email">
                      {userData.userEmail}
                    </div>
                    <hr />
                    <button
                      className="dropdown-item"
                      onClick={() => alert("Redirect to Change Password Page")}
                    >
                      🔐 Change Password
                    </button>
                    <button
                      className="dropdown-item logout"
                      onClick={logoutUser}
                    >
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
