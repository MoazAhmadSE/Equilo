// hooks/useGroupData.js
import { useState, useEffect } from "react";
import { doc, getDoc, collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { useNavigate } from "react-router-dom";

export const useGroupData = (groupId, user) => {
    const [groupData, setGroupData] = useState(null);
    const [creatorName, setCreatorName] = useState("Loading...");
    const [resolvedMembers, setResolvedMembers] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchGroup = async () => {
        setLoading(true);
        try {
            const groupRef = doc(db, "groups", groupId);
            const groupSnap = await getDoc(groupRef);
            if (!groupSnap.exists()) {
                navigate("/equilo/home", { replace: true });
                return;
            }

            const group = groupSnap.data();
            setGroupData(group);

            if (
                !group.members ||
                (!group.members.includes(user.uid) &&
                    !group.members.includes(user.email))
            ) {
                navigate("/equilo/home", { replace: true });
                return;
            }

            const creatorRef = doc(db, "users", group.createdBy);
            const creatorSnap = await getDoc(creatorRef);
            setCreatorName(
                creatorSnap.exists() ? creatorSnap.data().userName : group.createdBy
            );

            const uids = group.members.filter((m) => !m.includes("@"));
            const emails = group.members.filter((m) => m.includes("@"));

            let resolved = [];
            if (uids.length > 0) {
                const usersQuery = query(
                    collection(db, "users"),
                    where("userId", "in", uids)
                );
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

            emails.forEach((email) => {
                resolved.push({
                    id: email,
                    name: email,
                    email: email,
                    isAdmin: false,
                    isJoined: false,
                });
            });

            resolved.sort((a, b) => (b.isAdmin ? 1 : 0) - (a.isAdmin ? 1 : 0));
            setResolvedMembers(resolved);

            if (group.expenseIds && group.expenseIds.length > 0) {
                const expensePromises = group.expenseIds.map((id) =>
                    getDoc(doc(db, "expenses", id))
                );
                const expenseSnaps = await Promise.all(expensePromises);

                const expensesData = expenseSnaps
                    .filter((snap) => snap.exists())
                    // .map((snap) => ({ ...snap.data() }));
                    .map((snap) => ({ id: snap.id, ...snap.data() }));

                setExpenses(expensesData);
            } else {
                setExpenses([]);
            }
        } catch (error) {
            console.error("Failed to fetch group or expenses:", error);
            navigate("/equilo/home", { replace: true });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (groupId && user) {
            fetchGroup();
        }
    }, [groupId, user]);

    return {
        groupData,
        creatorName,
        resolvedMembers,
        expenses,
        loading,
        fetchGroup,
    };
};
