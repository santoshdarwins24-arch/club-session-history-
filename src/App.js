import "./App.css";
import "./index.css";
import { useEffect, useState } from "react";
import { db, auth } from "./firebase";

import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
  setDoc,
  updateDoc,increment
} from "firebase/firestore";

import {
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut
} from "firebase/auth";

import AdminPanel from "./AdminPanel";
import GlobalSearch from "./GlobalSearch";
import Profile from "./Profile";
import QRScanner from "./QRScanner";

function App() {

  const [showMenu, setShowMenu] = useState(false);
  const [page, setPage] = useState("home");

  const [user, setUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  const [username, setUsername] = useState("");
  const [points, setPoints] = useState(0);
  const [attendedSessions, setAttendedSessions] = useState([]);

  const [isAdmin, setIsAdmin] = useState(false);
const [adminRole, setAdminRole] = useState(null);
  const [loading, setLoading] = useState(false);

  /* ===============================
  AUTH STATE
  =============================== */

  useEffect(() => {

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {

      if (!currentUser) {
  setUser(null);
  setIsAdmin(false);
  setAdminRole(null);
  return;
}

      setUser(currentUser);

      try {
        const adminRef = doc(db, "admins", currentUser.uid);
const adminSnap = await getDoc(adminRef);

if (adminSnap.exists()) {
  setIsAdmin(true);
  setAdminRole(adminSnap.data().role || "admin");
} else {
  setIsAdmin(false);
  setAdminRole(null);
}
      } catch (error) {
        console.error("Admin check error:", error);
        setIsAdmin(false);
      }

      const userRef = doc(db, "users", currentUser.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {

        await setDoc(userRef, {
          username: currentUser.displayName,
          nameLower: currentUser.displayName.toLowerCase(),
          email: currentUser.email,
          points: 0,
          attendedSessions: [],
          createdAt: serverTimestamp()
        });

        setUsername(currentUser.displayName);
        setPoints(0);
        setAttendedSessions([]);

      } else {

        const data = userSnap.data();
        setUsername(data.username || "");
        setPoints(data.points || 0);
        setAttendedSessions(data.attendedSessions || []);

      }

    });

    return () => unsubscribe();

  }, []);

  /* ===============================
  LOGIN
  =============================== */

  const login = async () => {

    if (loading) return;

    setLoading(true);

    try {

      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);

    } catch (error) {

      if (error.code !== "auth/cancelled-popup-request") {
        console.error(error);
      }

    }

    setLoading(false);

  };

  /* ===============================
  LOGOUT
  =============================== */

  const logout = async () => {

    try {

      await signOut(auth);
      setUser(null);
      setPoints(0);
      setAttendedSessions([]);

    } catch (error) {

      console.error("Logout error:", error);

    }

  };

  /* ===============================
  HANDLE QR ATTENDANCE
  =============================== */

  const handleQRScan = async (session) => {

  const attendanceRef = doc(
    db,
    "users",
    user.uid,
    "attendance",
    session.id
  );

  const attendanceSnap = await getDoc(attendanceRef);

  if (attendanceSnap.exists()) {
    alert("You already attended this session!");
    return;
  }

  const userRef = doc(db, "users", user.uid);

  await updateDoc(userRef, {
    points: increment(session.points)
  });

  await setDoc(attendanceRef, {
    sessionId: session.id,
    title: session.title,
    points: session.points,
    attendedAt: serverTimestamp()
  });

  alert("Attendance recorded!");

};

  /* ===============================
  LOGIN SCREEN
  =============================== */

 if (!user) {
  return (
    <div className="login-container">
      <div className="login-card">

        <h1 className="title">F/stops Club</h1>

        <p className="subtitle">
          Capture moments.
        </p>

        <button className="google-btn" onClick={login}>
          <img
            src="https://developers.google.com/identity/images/g-logo.png"
            alt="google"
          />
          Continue with Google
        </button>

      </div>
    </div>
  );
}
  /* ===============================
  MAIN APP UI
  =============================== */

  return (

    <div className="container">

      {/* MENU */}

      <div className="menu-container">

        <button
          className="menu-btn"
          onClick={() => setShowMenu(!showMenu)}
        >
            {showMenu ? "✕" : "☰"}
        </button>

        {showMenu && (

          <div className="dropdown-menu">

            <button
              onClick={() => {
                setPage("home");
                setShowMenu(false);
              }}
            >
              Home
            </button>

            <button
              onClick={() => {
                setPage("search");
                setShowMenu(false);
              }}
            >
              Search
            </button>

            {isAdmin && (
              <button
                onClick={() => {
                  setPage("admin");
                  setShowMenu(false);
                }}
              >
                Admin Dashboard
              </button>
            )}

            <hr />

                <button className="logout" onClick={logout}>
                  Logout
                </button>
          </div>

        )}

      </div>

      {/* NAVBAR */}

      <div className="navbar">
        <h1 className="logo">F/stops</h1>
      </div>



{page === "home" && (
  <div className="dashboard">

    <div className="top-row">

      <div className="card">
        <QRScanner handleQRScan={handleQRScan} />
      </div>

      <div className="card">
        <Profile
          name={username}
          points={points}
          userId={user.uid}
          showHistory={false}
        />
      </div>

    </div>

    <div className="card history-wrapper">
      <Profile
        name={username}
        points={points}
        userId={user.uid}
        showHistory={true}
        historyOnly={true}
      />
    </div>

  </div>
)}

      {/* SEARCH PAGE */}

      {page === "search" && (
        <>
          <div className="card">
            <GlobalSearch
              currentUserId={user.uid}
              onUserSelect={(user) => setSelectedUser(user)}
            />
          </div>

          {selectedUser && (
            <div className="card">
              <Profile
                name={selectedUser.username}
                points={selectedUser.points}
                userId={selectedUser.id}
              />
            </div>
          )}
        </>
      )}

      {/* ADMIN PAGE */}

      {page === "admin" && isAdmin && (
        <div className="card">
          <AdminPanel adminRole={adminRole} />
        </div>
      )}

    </div>

  );

}

export default App;
