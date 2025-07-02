import React, { useEffect, useRef } from "react";
import "../../css/pages/App.css";

const UserDropdown = ({
  userData,
  onLogout,
  onChangePassword,
  setShowDropdown,
  showDropdown,
}) => {
  const dropDownRef = useRef();

  function handleClickOutside(event) {
    if (dropDownRef.current && !dropDownRef.current.contains(event.target)) {
      setShowDropdown((prev) => !prev);
    }
  }

  useEffect(() => {
    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  return (
    <div className="user-dropdown" ref={dropDownRef}>
      <div className="dropdown-item bold">{userData.userName}</div>
      <div className="dropdown-item email">{userData.userEmail}</div>
      <hr />
      <button className="dropdown-item" onClick={onChangePassword}>
        🔐 Change Password
      </button>
      <button className="dropdown-item logout" onClick={onLogout}>
        🚪 Logout
      </button>
    </div>
  );
};

export default UserDropdown;
