import { useState, useEffect } from "react";
import { db } from "./firebase";

import {
  collection,
  query,
  orderBy,
  onSnapshot
} from "firebase/firestore";

function Profile({ name, points, userId, showHistory, historyOnly }) {

  const [attendance, setAttendance] = useState([]);

  /* ===============================
  LOAD ATTENDANCE HISTORY
  =============================== */

  useEffect(() => {

  if (!userId) return;

  const attendanceRef = collection(db, "users", userId, "attendance");

  const q = query(
    attendanceRef,
    orderBy("attendedAt", "desc")
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {

  console.log("Attendance snapshot:", snapshot);
  console.log("Docs count:", snapshot.docs.length);

  const records = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));

  setAttendance(records);

});

  return () => unsubscribe();

}, [userId]);

  /* ===============================
  BADGE SYSTEM
  =============================== */

  const getBadgeInfo = (points) => {

    if (points >= 100) {
      return {
        name: "Gold",
        color: "#FFD700",
        next: null,
        remaining: 0,
        progress: 100
      };
    }

    if (points >= 50) {
      return {
        name: "Silver",
        color: "#C0C0C0",
        next: "Gold",
        remaining: 100 - points,
        progress: ((points - 50) / 50) * 100
      };
    }

    return {
      name: "Bronze",
      color: "#CD7F32",
      next: "Silver",
      remaining: 50 - points,
      progress: (points / 50) * 100
    };
  };

  const badge = getBadgeInfo(points);

  return (
  <div>

    {/* PROFILE CARD */}

    {!historyOnly && (
      <div className="profile-card">

        <div className="profile-header">

          <div className="profile-avatar">
            {name ? name.charAt(0).toUpperCase() : "U"}
          </div>

          <div>
            <h2 className="profile-name">{name}</h2>
            <p className="profile-points">{points} points</p>
          </div>

        </div>

        <div className="profile-badge-row">

          <span className="profile-label">Badge</span>

          <span
            className="badge-pill"
            style={{ backgroundColor: badge.color }}
          >
            {badge.name}
          </span>

        </div>

        {badge.next && (
          <div className="progress-section">

            <p className="progress-text">
              {badge.remaining} points to reach {badge.next}
            </p>

            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: `${badge.progress}%`,
                  backgroundColor: badge.color
                }}
              />
            </div>

          </div>
        )}

      </div>
    )}

    {/* HISTORY CARD */}

    {showHistory && (
      <div className="history-card">

        <h2 className="history-title">Sessions attended</h2>

        {attendance.length === 0 && (
          <p className="no-history">
            No sessions attended yet.
          </p>
        )}

        {attendance.map(record => (

          <div key={record.id} className="history-item">

            <div className="history-left">

              <p className="session-title">
                {record.title}
              </p>

              <p className="session-date">
                {record.attendedAt
                  ? record.attendedAt.toDate().toLocaleString()
                  : "Date unavailable"}
              </p>

            </div>

            <div className="session-points">
              +{record.points}
            </div>

          </div>

        ))}

      </div>
    )}

  </div>
);
}

export default Profile;

