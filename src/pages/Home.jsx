import { Outlet } from "react-router-dom";
import useUserProfile from "../hooks/useUserProfile"; // adjust the path if needed
import { useAuth } from "../context/AuthContext"; // adjust based on your setup

const Home = () => {
  const { currentUser } = useAuth(); // should return Firebase user object
  const { userData, loading, isOnline } = useUserProfile(currentUser?.uid);

  return (
    <div>
      <h1>Welcome to the Home Page</h1>

      {loading ? (
        <p>Loading user data...</p>
      ) : userData ? (
        <div style={{ marginBottom: "1rem" }}>
          <img
            src={userData.userImage || "/default-avatar.png"}
            alt="Profile"
            style={{ width: "50px", height: "50px", borderRadius: "50%" }}
          />
          <h2>{userData.userName}</h2>
          <p>{userData.userEmail}</p>
          <p>Status: {isOnline ? "🟢 Online" : "🔴 Offline"}</p>
        </div>
      ) : (
        <p>User not found</p>
      )}

      <div>
        <Outlet />
      </div>
    </div>
  );
};

export default Home;
