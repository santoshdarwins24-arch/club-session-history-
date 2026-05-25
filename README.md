#  Club Session App

A full-stack campus engagement and attendance management platform built using React and Firebase.  
The application allows clubs and organizations to manage sessions, track attendance using QR codes, and reward students with points based on participation.

It includes secure QR validation, admin controls, real-time analytics, and a gamified reward system to improve student engagement 🚀

---

# Features

##  User Features

- Secure Authentication
- QR Code Attendance Scanning
- Automatic Reward Points
- Attendance History
- User Dashboard
- Badge & Progress Tracking
- Real-Time Updates

---

##  Admin Features

- Create & Manage Sessions
- Generate Secure QR Codes
- Add / Reduce User Points
- User Search & Management
- Attendance Analytics
- Multi-Admin Role System
- Real-Time Dashboard Monitoring

---

##  Security Features

- Time-Limited QR Validation
- Token-Based Attendance Verification
- Duplicate Attendance Prevention
- Role-Based Access Control
- Secure Firebase Authentication

---

#  Tech Stack

## Frontend
- React.js
- Tailwind CSS
- React Router

## Backend / Database
- Firebase Authentication
- Cloud Firestore

## Additional Tools
- QR Scanner
- QR Generator
- Real-Time Database Sync

---

# Application Workflow

Admin Creates Session
        ↓
Secure QR Code Generated
        ↓
Students Scan QR Code
        ↓
Attendance Verified
        ↓
Points Automatically Added
        ↓
Admins Can Modify Points if Required


#  Dashboard Modules

## User Dashboard
- Total Points
- Attendance Records
- Earned Badges
- Progress Tracking

## Admin Dashboard
- Session Analytics
- Total Participants
- Active Sessions
- User Management
- Points Management
- Attendance Insights


#  Installation & Setup

##  Clone Repository

git clone https://github.com/your-username/club-session-app.git

##  Navigate to Project


cd club-session-app



##  Install Dependencies


npm install


---

## Configure Firebase

Create a `.env` file in the root directory and add:

```env
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

---

##  Start Development Server

```bash
npm start
```

---

# Project Structure


club-session-app/
│
├── public/
├── src/
│   ├── components/
│   ├── pages/
│   ├── firebase/
│   ├── context/
│   ├── hooks/
│   ├── utils/
│   └── App.js
│
├── .env
├── package.json
└── README.md


---

#  Future Enhancements

-  Mobile Application
-  Push Notifications
-  Reward Redemption System
-  AI-Based Participation Insights
-  Leaderboards
-  Event Scheduling System
-  Email Notifications

---

#  Contributing

Contributions are welcome!

If you'd like to improve the project:

1. Fork the repository
2. Create a new branch
3. Make your changes
4. Commit your changes
5. Push the branch
6. Open a Pull Request

---

#  License

This project is licensed under the MIT License.

---

#  Support

If you found this project useful:

- Give the repository a star
- Share it with others
- Contribute to the project

---

#  Author

Developed for improving campus engagement and simplifying club session management.
