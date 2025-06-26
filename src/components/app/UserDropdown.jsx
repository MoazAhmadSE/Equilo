import React from "react";
import "../../css/pages/App.css";

const UserDropdown = ({ userData, onLogout, onChangePassword }) => (
  <div className="user-dropdown">
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

export default UserDropdown;
