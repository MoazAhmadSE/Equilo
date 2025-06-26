import React from "react";
import "../../css/pages/Home.css";

const NotificationPanel = ({
  notifications,
  onClickNotification,
  onDeleteNotification,
}) => {
  return (
    <aside className="sidebar right-bar">
      <p className="hint">🔔 Notifications</p>

      {notifications.length > 0 ? (
        <div className="notification-list">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`notification-item ${n.read ? "read" : "unread"} ${
                n.link ? "clickable" : ""
              }`}
              onClick={() => n.link && onClickNotification(n.link)}
            >
              <span className="message-text">{n.message}</span>
              <button
                className="delete-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteNotification(n.id);
                }}
              >
                ❌
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-notifications">No notifications yet.</div>
      )}
    </aside>
  );
};

export default NotificationPanel;
