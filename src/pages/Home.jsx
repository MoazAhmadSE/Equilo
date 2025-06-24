import { useEffect, useState } from "react";
import { Link, Outlet } from "react-router-dom";
import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase/firebaseConfig";
import useUserProfile from "../hooks/useUserProfile";
import { useAuth } from "../context/AuthContext";
import "../css/pages/Home.css";
import EquiloNoteLoader from "../components/EquiloNoteLoader";
import SVGIcons from "../assets/icons/SVGIcons";
import MakeGroupModal from "../components/MakeGroupModal"; // ✅ keep this
// ❌ remove: import createGroup from "../firebase/utils/groupHandlers";

const Home = () => {
  const { user } = useAuth(); // <-- FIXED: use 'user' not 'currentUser'
  const { userData, loading, isOnline } = useUserProfile(user?.uid);

  const [rotatePlus, setRotatePlus] = useState(false);
  const [showMakeGroupModal, setShowMakeGroupModal] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [groupNames, setGroupNames] = useState({});
  const [userGroups, setUserGroups] = useState([]);
  const navigate = useNavigate();

  const handlePlusClick = () => {
    setRotatePlus(true);
    setShowMakeGroupModal(true); // open modal
    setTimeout(() => setRotatePlus(false), 600);
  };

  useEffect(() => {
    if (!user) return;

    // We'll collect notifications from both queries
    let notiMap = new Map();

    const q1 = query(
      collection(db, "notifications"),
      where("userId", "==", user.uid)
    );
    const q2 = query(
      collection(db, "notifications"),
      where("email", "==", user.email)
    );

    const unsub1 = onSnapshot(q1, (snap) => {
      snap.docs.forEach((docSnap) => {
        notiMap.set(docSnap.id, { id: docSnap.id, ...docSnap.data() });
      });
      setNotifications(Array.from(notiMap.values()));
    });
    const unsub2 = onSnapshot(q2, (snap) => {
      snap.docs.forEach((docSnap) => {
        notiMap.set(docSnap.id, { id: docSnap.id, ...docSnap.data() });
      });
      setNotifications(Array.from(notiMap.values()));
    });

    return () => {
      unsub1();
      unsub2();
    };
  }, [user]);

  // Handle notification click
  const handleNotificationClick = (link) => {
    if (link) navigate(link);
  };

  // Group notifications by groupId
  const groupNotifications = {};
  const generalNotifications = [];

  notifications.forEach((n) => {
    if (n.groupId) {
      if (!groupNotifications[n.groupId]) groupNotifications[n.groupId] = [];
      groupNotifications[n.groupId].push(n);
    } else {
      generalNotifications.push(n);
    }
  });

  useEffect(() => {
    const fetchGroupNames = async () => {
      const ids = Object.keys(groupNotifications);
      const names = {};
      for (const id of ids) {
        const groupDoc = await getDoc(doc(db, "groups", id));
        if (groupDoc.exists()) {
          names[id] = groupDoc.data().groupName || id;
        } else {
          names[id] = id;
        }
      }
      setGroupNames(names);
    };
    if (Object.keys(groupNotifications).length > 0) fetchGroupNames();
  }, [notifications]);

  useEffect(() => {
    if (!user) return;
    const ref = collection(db, "users", user.uid, "userGroups");
    const unsub = onSnapshot(ref, (snap) => {
      setUserGroups(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, [user]);

  console.log("Fetched notifications:", notifications);
  console.log("Current user:", user);

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
          <ul>
            {userGroups.map((group) => (
              <li key={group.groupId}>{group.groupName}</li>
            ))}
          </ul>
        </div>
      </aside>

      <MakeGroupModal
        isOpen={showMakeGroupModal}
        onClose={() => setShowMakeGroupModal(false)}
        currentUser={user}
      />

      <main className="main-content-center">
        <Outlet />
      </main>

      <aside className="sidebar right-bar">
        <p className="hint">🔔 Notifications</p>
        {notifications.length > 0 ? (
          <ul>
            {notifications.map((n) => (
              <li
                key={n.id}
                className={`notification-item ${n.read ? "read" : "unread"} ${
                  n.link ? "clickable" : ""
                }`}
                onClick={() => handleNotificationClick(n.link)}
              >
                {n.message}
              </li>
            ))}
          </ul>
        ) : (
          <div className="no-notifications">No notifications yet.</div>
        )}
        <p className="hint">💬 Support</p>
      </aside>
    </div>
  );
};

export default Home;
