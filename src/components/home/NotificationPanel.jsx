import "../../css/pages/Home.css";
import SVGIcons from "../../assets/icons/SVGIcons";

const NotificationPanel = ({
  notifications,
  onClickNotification,
  onDeleteNotification,
}) => {
  return (
    <aside className="sidebar right-bar">
      <p className="notification-title">🔔 Notifications</p>

      {notifications.length > 0 ? (
        <div>
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className="notification-item"
              onClick={() => notif.link && onClickNotification(notif.link)}
            >
              <span className="message-text">{notif.message}</span>
              <SVGIcons.closeCross
                fill="red"
                onClick={() => onDeleteNotification(notif.id)}
              />
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
