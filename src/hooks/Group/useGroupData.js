// src/hooks/useGroupData.js
import { useState, useEffect, useCallback } from "react";
import { doc, getDoc, collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { useAuth } from "../context/AuthContext";

export default function useGroupData(groupId) {
  const { user } = useAuth();

  const [groupData, setGroupData] = useState(null);
  const [creatorName, setCreatorName] = useState("Loading...");
  const [resolvedMembers, setResolvedMembers] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchGroup = useCallback(async () => {
    setLoading(true);
    try {
      const groupRef = doc(db, "groups", groupId);
      const groupSnap = await getDoc(groupRef);
      if (!groupSnap.exists()) {
        setGroupData(null);
        return;
      }

      const group = groupSnap.data();

      if (
        !group.members ||
        (!group.members.includes(user.uid) && !group.members.includes(user.email))
      ) {
        setGroupData(null);
        return;
      }

      setGroupData(group);

      // Fetch creator name
      const creatorRef = doc(db, "users", group.createdBy);
      const creatorSnap = await getDoc(creatorRef);
      setCreatorName(creatorSnap.exists() ? creatorSnap.data().userName : group.createdBy);

      // Resolve members
      const uids = group.members.filter((m) => !m.includes("@"));
      const emails = group.members.filter((m) => m.includes("@"));

      let resolved = [];

      if (uids.length > 0) {
        const usersQuery = query(collection(db, "users"), where("userId", "in", uids));
        const userSnaps = await getDocs(usersQuery);

        userSnaps.docs.forEach((docSnap) => {
          const data = docSnap.data();
          resolved.push({
            id: data.userId,
            name: data.userName,
            email: data.userEmail,
            isAdmin: data.userId === group.createdBy,
            isJoined: true,
          });
        });
      }

      // Add unresolved emails as not joined
      emails.forEach((email) => {
        resolved.push({
          id: email,
          name: email,
          email,
          isAdmin: false,
          isJoined: false,
        });
      });

      // Sort admin on top
      resolved.sort((a, b) => (b.isAdmin ? 1 : 0) - (a.isAdmin ? 1 : 0));

      setResolvedMembers(resolved);

      // Fetch expenses
      if (group.expenseIds?.length > 0) {
        const expensePromises = group.expenseIds.map((id) => getDoc(doc(db, "expenses", id)));
        const expenseSnaps = await Promise.all(expensePromises);

        const expensesData = expenseSnaps
          .filter((snap) => snap.exists())
          .map((snap) => ({ id: snap.id, ...snap.data() }));

        setExpenses(expensesData);
      } else {
        setExpenses([]);
      }
    } catch (error) {
      console.error("Failed to fetch group or expenses:", error);
      setGroupData(null);
    } finally {
      setLoading(false);
    }
  }, [groupId, user]);

  // Load initially and when groupId/user changes
  useEffect(() => {
    fetchGroup();
  }, [fetchGroup]);

  return {
    groupData,
    creatorName,
    resolvedMembers,
    expenses,
    loading,
    refresh: fetchGroup,
  };
}
