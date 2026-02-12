````md
# 🔐 MERN AuthSecure (Reusable Auth + Admin Dashboard)

A modern **full-stack MERN authentication system** with **Admin Dashboard**, built for reusable production-ready login systems.  
Includes **JWT auth, OAuth (Google/GitHub), Email OTP/Verification, Profile Uploads, Activity Tracking, and Firebase Push Notifications**.

![Node.js](https://img.shields.io/badge/Node.js-v18+-green)
![Express](https://img.shields.io/badge/Express-v5.1.0-black)
![React](https://img.shields.io/badge/React-Vite-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-Prisma-brightgreen)
![License](https://img.shields.io/badge/License-ISC-yellow)

---

## 🌟 Features

### ✅ User Client
- **🔑 JWT Authentication** — Secure login sessions
- **📧 Email Authentication** — OTP / email verification support
- **🧑 Profile Management** — Update details + profile image upload
- **🎨 Dashboard Layout** — Sidebar + navbar + protected routes
- **🕒 Activity Tracking** — Fetch user activity feed (`/api/user/activity`)
- **⚙️ Settings Page** — Theme toggle + account actions (suspend/permanent)

### ✅ Admin Client
- **🛡️ Admin Login** — Dedicated admin authentication
- **📊 Admin Dashboard** — Stats, user management UI
- **📢 Broadcast Notifications UI** — Admin can push notifications/messages
- **👥 Manage Users** — View users and manage status

### ✅ Key Highlights
- ✅ **Reusable Auth System** — Plug into any MERN project
- ✅ **Modular Backend Core** — Strategy-based authentication system
- ✅ **JWT + OAuth Ready** — Local + Google + GitHub
- ✅ **No Mock Data** — MongoDB/Prisma-backed API responses
- ✅ **Responsive UI** — Works across desktop and mobile

---

## 🏗️ Tech Stack

### Backend
- **Runtime:** Node.js v18+
- **Framework:** Express.js
- **Database:** MongoDB + Prisma
- **Auth:** JWT + Strategy pattern (`LocalStrategy`, `OAuthStrategy`, `PasswordlessStrategy`)
- **Email:** SMTP (Gmail recommended)
- **Uploads:** Multer
- **Push:** Firebase Admin SDK (FCM)

### Frontend (Client + Admin)
- **Framework:** React (Vite)
- **Routing:** React Router DOM
- **Styling:** TailwindCSS
- **UI Components:** shadcn/ui + Radix UI
- **Icons:** lucide-react
- **HTTP:** Axios

---

## 📁 Project Structure

```txt
primetrade AI/
│── README.md
│
│── server/                          # Backend API (Node.js + Express + Prisma)
│   ├── controller/                  # Controllers (auth, admin, user, push)
│   │   ├── adminController.js
│   │   ├── authController.js
│   │   ├── pushController.js
│   │   └── userController.js
│   │
│   ├── middleware/                  # Auth & upload middleware
│   │   ├── authmiddleware.js
│   │   └── upload.js
│   │
│   ├── prisma/                      # Prisma schema
│   │   └── schema.prisma
│   │
│   ├── routes/                      # API route definitions
│   │   ├── admin.routes.js
│   │   ├── auth.routes.js
│   │   ├── user.routes.js
│   │   └── userPushRoutes.js
│   │
│   ├── scripts/                     # One-time scripts
│   │   └── seedAdmin.js
│   │
│   ├── src/core/                    # Auth core (strategy-based)
│   │   ├── auth/
│   │   │   ├── AuthManager.js
│   │   │   └── strategies/
│   │   │       ├── LocalStrategy.js
│   │   │       ├── OAuthStrategy.js
│   │   │       └── PasswordlessStrategy.js
│   │   │
│   │   └── services/
│   │       ├── ActivityService.js
│   │       ├── EmailService.js
│   │       └── UserService.js
│   │
│   ├── templates/emails/            # Email templates (EJS)
│   │   ├── account-locked.ejs
│   │   ├── magic-link.ejs
│   │   ├── otp.ejs
│   │   ├── password-reset.ejs
│   │   ├── verification-email.ejs
│   │   └── welcome.ejs
│   │
│   ├── utils/                       # Utilities
│   │   ├── dbConnector.js
│   │   ├── seedAdmin.js
│   │   ├── cron/
│   │   │   └── broadcastScheduler.js
│   │   └── push/
│   │       └── fcm.js
│   │
│   ├── firebase/                    # Firebase Admin SDK
│   │   └── serviceAccountKey.json
│   │
│   ├── .env
│   ├── .env.example
│   ├── .gitignore
│   ├── index.js                     # Server entry point
│   ├── package.json
│   ├── package-lock.json
│   └── README.md
│
│── USER UI/                         # User Client (Vite + React)
│   ├── public/
│   │   ├── firebase-messaging-sw.js
│   │   └── vite.svg
│   │
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   └── ProtectedRoutes.jsx
│   │   │   └── layout/
│   │   │       └── DashboardLayout.jsx
│   │   │
│   │   ├── lib/
│   │   │   ├── auth/
│   │   │   │   ├── authService.js
│   │   │   │   └── hooks/
│   │   │   │       └── useAuth.jsx
│   │   │   └── push/
│   │   │       ├── firebaseClient.js
│   │   │       └── registerServiceWorker.js
│   │   │
│   │   ├── pages/
│   │   │   ├── AuthCallback.jsx
│   │   │   ├── AuthPage.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── LandingPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── NotFound.jsx
│   │   │   ├── NotificationsPage.jsx
│   │   │   ├── ProfilePage.jsx
│   │   │   ├── RateLimitPage.jsx
│   │   │   ├── ReactivatePage.jsx
│   │   │   ├── SettingsPage.jsx
│   │   │   └── VerifyEmail.jsx
│   │   │
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── main.jsx
│   │   └── index.css
│   │
│   ├── .env
│   ├── .env.example
│   ├── .gitignore
│   ├── eslint.config.js
│   ├── index.html
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   ├── vite.config.js
│   ├── package.json
│   ├── package-lock.json
│   └── README.md
│
│── ADMIN UI/                        # Admin Dashboard (Vite + React)
│   ├── public/
│   │   └── vite.svg
│   │
│   ├── src/
│   │   ├── layouts/
│   │   │   └── AdminLayout.jsx
│   │   │
│   │   ├── lib/admin/
│   │   │   ├── adminApi.js
│   │   │   └── adminAuth.js
│   │   │
│   │   ├── pages/admin/
│   │   │   ├── AdminBroadcast.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── AdminLogin.jsx
│   │   │   ├── AdminProfile.jsx
│   │   │   ├── AdminSettings.jsx
│   │   │   └── ManageUsers.jsx
│   │   │
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── main.jsx
│   │   └── index.css
│   │
│   ├── .gitignore
│   ├── eslint.config.js
│   ├── index.html
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   ├── vite.config.js
│   ├── package.json
│   ├── package-lock.json
│   └── README.md
````

---

## 🚀 Quick Start

### ✅ Prerequisites

* Node.js **v18+**
* MongoDB (local or Atlas)
* Gmail account (for SMTP)
* Firebase project (optional, only for push notifications)

---

## 1️⃣ Clone Repository

```bash
git clone <your-repo-url>
cd "ALL IN ONE PROJECT USE"
```

---

## 2️⃣ Setup Backend (server/)

```bash
cd server
npm install
```

### Prisma Setup (Required)

```bash
npx prisma generate
```

(optional if using MongoDB changes)

```bash
npx prisma db push
```

### Start Backend

```bash
npm run dev
```

Backend runs on:

```
http://localhost:5000
```

---

## 3️⃣ Setup Client (client/)

```bash
cd ../client
npm install
npm run dev
```

Client runs on:

```
http://localhost:5173
```

---

## 4️⃣ Setup Admin Client (adminClient/)

```bash
cd ../adminClient
npm install
npm run dev
```

Admin runs on:

```
http://localhost:5174
```

---

## ✅ Port Summary

| Service      | URL                                            |
| ------------ | ---------------------------------------------- |
| Backend API  | [http://localhost:5000](http://localhost:5000) |
| Client       | [http://localhost:5173](http://localhost:5173) |
| Admin Client | [http://localhost:5174](http://localhost:5174) |

---

## 🔐 Environment Variables

### ✅ Client Env (`client/.env`)

Create file: `client/.env`

```env
# Backend API URL
VITE_BACKEND_URL=http://localhost:5000
VITE_API_BASE_URL=http://localhost:5000

# OAuth Credentials
VITE_GOOGLE_CLIENT_ID=
VITE_GITHUB_CLIENT_ID=

# Firebase (Required only if Push Notifications enabled)
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_VAPID_KEY=
```

---

### ✅ Server Env (`server/.env`)

Create file: `server/.env`

```env
# Server Configuration
PORT=5000
NODE_ENV=development
APP_NAME="My Reusable Auth"

# Database (Prisma + MongoDB)
DATABASE_URL=""

# Security
JWT_SECRET="generate-a-very-long-random-string-here"

# Frontend Connection
CLIENT_URL="http://localhost:5173,http://localhost:5174"
BASE_URL=http://localhost:5000
CLIENT_USER=5173

# Email Configuration (Gmail SMTP)
# IMPORTANT: EMAIL_PASS must be a Gmail 16-character App Password
EMAIL_HOST=""
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=""
EMAIL_PASS=""
EMAIL_FROM="noreply@tarun.com"

# OAuth Credentials (Google)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=

# OAuth Credentials (GitHub)
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# Admin Seed Credentials
ADMIN_EMAIL=
ADMIN_PASSWORD=
ADMIN_NAME=

# Firebase Admin SDK
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase/serviceAccountKey.json
```

---

## 🔔 Firebase Push Notifications (Optional)

This project supports Push Notifications using Firebase Cloud Messaging (FCM):

* **Client:** Firebase Web Push
* **Server:** Firebase Admin SDK

Required server file:

📌 `server/firebase/serviceAccountKey.json`

✅ Example format (DO NOT use real keys in this repo):

```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "your-private-key-id",
  "private_key": "-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com",
  "client_id": "your-client-id",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40your-project-id.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
}
```

⚠️ Never commit `serviceAccountKey.json` to GitHub.

---

## 📚 Useful Commands

### Prisma Commands

```bash
cd server
npx prisma generate
npx prisma db push
```

### Run All Apps Together

Open 3 terminals:

**Terminal 1**

```bash
cd server
npm run dev
```

**Terminal 2**

```bash
cd client
npm run dev
```

**Terminal 3**

```bash
cd adminClient
npm run dev
```

---

## 🐛 Troubleshooting

### Backend not starting

* Check MongoDB is running
* Verify `server/.env` exists
* Check `DATABASE_URL` is correct
* Ensure port 5000 is not already used

### Client not connecting to backend

* Check backend is running at `http://localhost:5000`
* Verify `.env` has correct `VITE_BACKEND_URL`

### Email not sending

* Use Gmail **App Password**
* Enable 2FA in Gmail
* EMAIL_USER must be correct Gmail address

---

## 🔒 Security Notes

✅ Add `.env` in `.gitignore`:

```gitignore
.env
```

❌ Never expose:

* JWT_SECRET
* Admin credentials
* Firebase serviceAccountKey.json

```
```
