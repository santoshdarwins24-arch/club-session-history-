import { useEffect, useState } from "react";
import { db } from "./firebase";
import {
  collection,
  query,
  orderBy,
  startAt,
  endAt,
  onSnapshot
} from "firebase/firestore";

function GlobalSearch({ currentUserId, onUserSelect }) {

  const [searchTerm, setSearchTerm] = useState("");
const [users, setUsers] = useState([]);
const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {

    if (!searchTerm.trim()) {
      setUsers([]);
      return;
    }

    const searchLower = searchTerm.toLowerCase();

    const q = query(
      collection(db, "users"),
      orderBy("nameLower"),
      startAt(searchLower),
      endAt(searchLower + "\uf8ff")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {

      const results = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter((user) => user.id !== currentUserId);

      setUsers(results);

    });

    return () => unsubscribe();

  }, [searchTerm, currentUserId]);

  return (
    <div className="global-search">

     <div 
  className="search-header"
  onClick={() => setShowSearch(!showSearch)}
>
  <h2 className="search-title">
    Search Members
  </h2>
</div>

{showSearch && (
<div className="search-box">
        <input
          className="search-input"
          type="text"
          placeholder="Search member name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {searchTerm && (
          <div className="search-dropdown">

            {users.length === 0 && (
              <div className="dropdown-empty">
                No users found
              </div>
            )}

            {users.map((user) => (
              <div
                key={user.id}
                className="dropdown-item"
                onClick={() => {
                  onUserSelect(user);
                  setSearchTerm("");
                  setUsers([]);
                }}
              >
                <div className="dropdown-avatar">
                  {user.username?.charAt(0).toUpperCase()}
                </div>

                <div className="dropdown-name">
                  {user.username}
                </div>

              </div>
            ))}

          </div>
        )}

      </div>
)}

    </div>
  );
}

export default GlobalSearch;
