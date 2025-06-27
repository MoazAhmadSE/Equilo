import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  getDoc,
  doc,
  query,
  where,
} from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase/firebaseConfig";
import "../css/components/UserDebtsByGroup.css";

const UserDebtsByGroup = () => {
  const { user } = useAuth();
  const [debts, setDebts] = useState([]);
  const [expandedGroupId, setExpandedGroupId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDebts = async () => {
      if (!user?.uid) return;

      const balancesQuery = query(
        collection(db, "balances"),
        where("fromUserId", "==", user.uid)
      );
      const balancesSnap = await getDocs(balancesQuery);

      const groupMap = new Map();

      for (const balanceDoc of balancesSnap.docs) {
        const data = balanceDoc.data();
        const { toUserId, groupId, amount } = data;

        if (amount <= 0) continue;

        const [toUserSnap, groupSnap] = await Promise.all([
          getDoc(doc(db, "users", toUserId)),
          getDoc(doc(db, "groups", groupId)),
        ]);

        const toUserName = toUserSnap.exists()
          ? toUserSnap.data().userName
          : "Unknown";

        const groupName = groupSnap.exists()
          ? groupSnap.data().groupName
          : "Unknown Group";

        if (!groupMap.has(groupId)) {
          groupMap.set(groupId, {
            groupName,
            groupId,
            items: [],
          });
        }

        groupMap.get(groupId).items.push({
          to: toUserName,
          amount,
        });
      }

      setDebts(Array.from(groupMap.values()));
      setLoading(false);
    };

    fetchDebts();
  }, [user]);

  const toggleGroup = (groupId) => {
    setExpandedGroupId((prev) => (prev === groupId ? null : groupId));
  };

  if (loading) return <div>Fetching your group dues...</div>;

  return (
    <div className="user-debts-section">
      <h2 className="section-heading">💸 Your Group Dues</h2>

      {debts.length === 0 ? (
        <p>You don’t owe anything in any group.</p>
      ) : (
        debts.map((group) => (
          <div key={group.groupId} className="debt-group-block">
            <div
              className="group-header"
              onClick={() => toggleGroup(group.groupId)}
            >
              <span>{group.groupName}</span>
              <span style={{ fontSize: "1.2rem" }}>
                {expandedGroupId === group.groupId ? "▲" : "▼"}
              </span>
            </div>

            {expandedGroupId === group.groupId && (
              <div className="debt-buttons">
                {group.items.map((d, i) => (
                  <div key={i} className="debt-row-item">
                    <span className="debt-user">To: {d.to}</span>
                    <span className="debt-amount">₹{d.amount.toFixed(2)}</span>
                    <span style={{ color: "red" }} title="You owe">
                      🔺
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default UserDebtsByGroup;
