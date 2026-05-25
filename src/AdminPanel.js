

import { useEffect, useState } from "react";
import { db, auth } from "./firebase";

import {
  collection,
  onSnapshot,
  getDocs,
  updateDoc,
  doc,
  addDoc,
  serverTimestamp,
  getDoc,
  setDoc,
  deleteDoc
} from "firebase/firestore";

const SUPER_ADMIN_UID = "GIUqtfULRHM2oUMB2HYlGocOwtf2v";

function AdminPanel() {

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalSessions: 0,
    totalAttendance: 0,
    totalPoints: 0
  });

  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [admins, setAdmins] = useState([]);

  const [selectedUser, setSelectedUser] = useState("");
  const [reducePoints, setReducePoints] = useState("");

  const [title, setTitle] = useState("");
  const [points, setPoints] = useState("");
  const [token, setToken] = useState("");
  const [expiryMinutes, setExpiryMinutes] = useState("");

  const [selectedAdminUser, setSelectedAdminUser] = useState("");
const currentAdminUID = auth.currentUser?.uid;

useEffect(() => {

  const unsubscribe = auth.onAuthStateChanged((user) => {
    if (user) {
      setCurrentUser(user);
    }
  });

  return () => unsubscribe();

}, []);

/* ===============================
   REAL TIME ADMIN LIST
================================ */

useEffect(() => {

  if (!currentUser) return;

  const unsubscribeAdmins = onSnapshot(
    collection(db, "admins"),
    (snapshot) => {

      const adminList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setAdmins(adminList);
    }
  );

  return () => unsubscribeAdmins();

}, [currentUser]);



/* ===============================
   LIVE DASHBOARD STATS
================================ */

useEffect(() => {

  if (!currentUser) return;

  const unsubscribeUsers = onSnapshot(
    collection(db, "users"),
    async (usersSnap) => {

      let totalPoints = 0;
      let totalAttendance = 0;

      const totalUsers = usersSnap.size;

      const sessionsSnap = await getDocs(collection(db, "sessions"));
      const totalSessions = sessionsSnap.size;

      let usersList = [];

      for (const userDoc of usersSnap.docs) {

        usersList.push({
          id: userDoc.id,
          ...userDoc.data()
        });

        const attendanceSnap = await getDocs(
          collection(db, "users", userDoc.id, "attendance")
        );

        totalAttendance += attendanceSnap.size;

        attendanceSnap.docs.forEach(attDoc => {
          totalPoints += attDoc.data().points || 0;
        });
      }

      setUsers(usersList);

      setStats({
        totalUsers,
        totalSessions,
        totalAttendance,
        totalPoints
      });
    }
  );

  return () => unsubscribeUsers();

}, [currentUser]);


/* ===============================
   REDUCE USER POINTS
================================ */

const reduceUserPoints = async () => {

  if (!selectedUser || !reducePoints) {
    alert("Select user and enter points");
    return;
  }

  try {

    const userRef = doc(db, "users", selectedUser);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      alert("User not found");
      return;
    }

    const currentPoints = userSnap.data().points || 0;

    const newPoints = Math.max(
      0,
      currentPoints - Number(reducePoints)
    );

    await updateDoc(userRef, {
      points: newPoints
    });

    setStats((prev) => ({
      ...prev,
      totalPoints: prev.totalPoints - Number(reducePoints)
    }));

    alert("Points reduced successfully");

    setReducePoints("");

  } catch (error) {
    console.error("Error reducing points:", error);
  }
};



/* ===============================
   CREATE SESSION
================================ */

const createSession = async () => {

  if (!title || !points || !token || !expiryMinutes) {
    alert("Please fill all fields");
    return;
  }

  const startTime = new Date();

  const expiryTime = new Date(
    startTime.getTime() + expiryMinutes * 60000
  );

  const docRef = await addDoc(collection(db, "sessions"), {
    title,
    points: Number(points),
    token,
    startTime,
    expiryTime,
    active: true,
    createdAt: serverTimestamp()
  });

  const qrText = `${docRef.id}|${token}`;

  alert(
`Session Created!

Title: ${title}

QR TEXT:
${qrText}

Use this text to generate a QR code`
  );

  setTitle("");
  setPoints("");
  setToken("");
  setExpiryMinutes("");
};



/* ===============================
   ADD NEW ADMIN
================================ */

const addAdmin = async () => {

  if (!selectedAdminUser) {
    alert("Select user to make admin");
    return;
  }

  // Prevent adding the same admin again
  if (admins.some(admin => admin.id === selectedAdminUser)) {
    alert("User is already an admin");
    return;
  }

  const userRef = doc(db, "users", selectedAdminUser);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    alert("User not found");
    return;
  }

  const userData = userSnap.data();

  await setDoc(doc(db, "admins", selectedAdminUser), {
    name: userData.name || "",
    email: userData.email || "",
    createdAt: serverTimestamp()
  });

  alert("Admin added successfully");
};


/* ===============================
   REMOVE ADMIN
================================ */

const removeAdmin = async (uid) => {

  if (uid === SUPER_ADMIN_UID) {
    alert("Super admin cannot be removed");
    return;
  }

  if (uid === currentAdminUID) {
    alert("You cannot remove yourself");
    return;
  }

  try {

    const adminsSnap = await getDocs(collection(db, "admins"));

    if (adminsSnap.size <= 2) {
      alert("At least two admins must remain");
      return;
    }

    await deleteDoc(doc(db, "admins", uid));

    alert("Admin removed");

  } catch (error) {
    console.error("Error removing admin:", error);
  }
};


/* ===============================
   UI
================================ */

return (

<div className="admin-dashboard">

<h1 className="dashboard-title">Admin Dashboard</h1>

{/* ROW 1 */}

<div className="dashboard-row">

{/* STATS CARD */}

<div className="card">

<h2>Platform Stats</h2>

<div className="stats-grid">

<div className="stat-box">
<div className="stat-number">{stats.totalUsers}</div>
<div className="stat-label">Users</div>
</div>

<div className="stat-box">
<div className="stat-number">{stats.totalSessions}</div>
<div className="stat-label">Sessions</div>
</div>

<div className="stat-box">
<div className="stat-number">{stats.totalAttendance}</div>
<div className="stat-label">Attendance</div>
</div>

<div className="stat-box">
<div className="stat-number">{stats.totalPoints}</div>
<div className="stat-label">Points</div>
</div>

</div>

</div>


{/* CREATE SESSION */}

<div className="card">

<h2>Create Session</h2>

<input
placeholder="Session Title"
value={title}
onChange={(e) => setTitle(e.target.value)}
/>

<input
type="number"
placeholder="Points"
value={points}
onChange={(e) => setPoints(e.target.value)}
/>

<input
placeholder="QR Token"
value={token}
onChange={(e) => setToken(e.target.value)}
/>

<input
type="number"
placeholder="Expiry Time (minutes)"
value={expiryMinutes}
onChange={(e) => setExpiryMinutes(e.target.value)}
/>

<button className="primary-btn" onClick={createSession}>
Create Session
</button>

</div>

</div>



{/* ROW 2 */}

<div className="dashboard-row">

{/* REDUCE POINTS */}

<div className="card">

<h2>Reduce User Points</h2>

<select
value={selectedUser}
onChange={(e) => setSelectedUser(e.target.value)}
>

<option value="">Select User</option>

{users.map((user) => (
<option key={user.id} value={user.id}>
{user.name || user.email}
</option>
))}

</select>

<input
type="number"
placeholder="Points to reduce"
value={reducePoints}
onChange={(e) => setReducePoints(e.target.value)}
/>

<button className="primary-btn" onClick={reduceUserPoints}>
Reduce Points
</button>

</div>



{/* ADMIN MANAGEMENT */}

<div className="card">

<h2>Admin Management</h2>

<div className="admin-form">

<select
value={selectedAdminUser}
onChange={(e) => setSelectedAdminUser(e.target.value)}
>
<option value="">Select User</option>

{users
.filter(user =>
  user.id !== currentAdminUID && 
  !admins.some(admin => admin.id === user.id)
)
.map((user) => (

<option key={user.id} value={user.id}>
{user.name || user.email}
</option>

))}

</select>

<button className="primary-btn" onClick={addAdmin}>
Make Admin
</button>

</div>

<div className="admin-list">

<h3 className="admin-list-title">Current Admins</h3>

{admins
.filter(admin => admin.id !== SUPER_ADMIN_UID)
.map((admin) => (

<div key={admin.id} className="admin-row">

<span>{admin.name || admin.email}</span>

{admin.id !== currentAdminUID && (

<button
className="remove-btn"
onClick={() => removeAdmin(admin.id)}
disabled={admins.length <= 2}
>
Remove
</button>

)}

</div>

))}

</div>

</div>
</div>
</div>

);
}

export default AdminPanel;
 