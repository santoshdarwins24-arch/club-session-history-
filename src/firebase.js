import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
const firebaseConfig = {
  apiKey: "AIzaSyAi5hTVvVGdy_ZA40e45_NMAvNmFJpOwUk",
  authDomain: "campus-loyality-app.firebaseapp.com",
  projectId: "campus-loyality-app",
  storageBucket: "campus-loyality-app.appspot.com",
  messagingSenderId: "196279391127",
  appId: "1:196279391127:web:0bf15c0ee2f88514582ad2"
};

/* ===============================
   INITIALIZE FIREBASE
================================ */

const app = initializeApp(firebaseConfig);

/* ===============================
   SERVICES
================================ */

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

/* ===============================
   EXPORT APP (optional)
================================ */

export default app;
