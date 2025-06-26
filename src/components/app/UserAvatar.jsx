import React from "react";
import "../../css/pages/App.css";

const UserAvatar = ({ initials, color, isOnline }) => (
  <div className="avatar-outer">
    <div className="avatar-inner">
      <div className="user-initials">
        <span className="avatar-content" style={{ backgroundColor: color }}>
          {initials}
        </span>
      </div>
    </div>
    <div
      className={`avatar-rotating-border ${isOnline ? "online" : "offline"}`}
    />
  </div>
);

export default UserAvatar;
