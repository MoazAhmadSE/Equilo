// src/pages/InvitePage.jsx
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

const InvitePage = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const checkUserAndRedirect = async (user) => {
      try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          // 👤 Firestore record doesn't exist → redirect to signup
          navigate(`/signup?redirect=/invite/${groupId}`);
        } else {
          // ✅ Already registered user
          navigate(`/group/join/${groupId}`);
        }
      } catch (err) {
        console.error("🔥 Invite check failed:", err);
        navigate("/error");
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate(`/login?redirect=/invite/${groupId}`);
      } else {
        checkUserAndRedirect(user);
      }
    });

    return () => unsubscribe();
  }, [groupId, navigate]);

  return <p style={{ padding: 20 }}>Processing invite…</p>;
};

export default InvitePage;
