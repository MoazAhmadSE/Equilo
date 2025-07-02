import { useState } from "react";
import ToggleTheme from "./ToggleTheme";
import UserAvatar from "./UserAvatar";
import UserDropdown from "./UserDropdown";
import SVGIcons from "../../assets/icons/SVGIcons";
import constants from "../../assets/constants/static.json";
import useStringToColor from "../../hooks/useStringToColor";
import useFirestoreNetworkManager from "../../hooks/useFirestoreNetworkManager";
import { useAuth } from "../../context/AuthContext";
import useUserProfile from "../../firebase/utils/useUserProfile";

const Header = () => {
  const { user, logoutUser } = useAuth();
  const { userData, loading } = useUserProfile();
  const isOnline = useFirestoreNetworkManager();

  const [showDropdown, setShowDropdown] = useState(false);

  const avatarColor = useStringToColor(
    userData?.userName || userData?.userEmail
  );
  const initials =
    userData?.userName?.[0]?.toUpperCase() ||
    userData?.userEmail?.[0]?.toUpperCase() ||
    "🤵🏻";

  return (
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
              onClick={() => setShowDropdown((prev) => !prev)}
            >
              <UserAvatar
                initials={initials}
                color={avatarColor}
                isOnline={isOnline}
              />
              {showDropdown && (
                <UserDropdown
                  userData={userData}
                  onLogout={(e) => {
                    e.stopPropagation();
                    logoutUser();
                  }}
                  onChangePassword={(e) => {
                    e.stopPropagation();
                    alert("Redirect to Change Password Page");
                  }}
                  showDropdown={showDropdown}
                  setShowDropdown={setShowDropdown}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
