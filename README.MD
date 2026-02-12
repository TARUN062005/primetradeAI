# Primetrade AI - Full-Stack Monorepo

## Project Overview

Primetrade AI is a robust, full-stack application designed to provide a comprehensive user management and notification system. It features a secure authentication mechanism supporting local, social, and passwordless (magic link) logins. The system is split into three main components: a powerful backend server, a user-facing frontend, and a dedicated admin dashboard for system management.

Key features include:
- **Authentication System:** Support for Email/Password, Google, GitHub, Facebook, and Magic Link logins.
- **Role-Based Access Control (RBAC):** Distinct roles for USER and ADMIN with protected routes.
- **Advanced Notification System:** Real-time notifications via In-App, Email, and Push (Web/Android/iOS) channels.
- **Broadcast Scheduler:** Admin capability to schedule and manage broadcast messages.
- **Admin Dashboard:** Full control over users, broadcasts, analytics, and system settings.

## Architecture Overview

The project follows a modern monorepo structure:

- **Backend:** Built with **Node.js**, **Express**, and **Prisma ORM**, connecting to a **MongoDB** database. It handles all business logic, data persistence, and background jobs.
- **User Frontend (USER UI):** A fast, responsive Single Page Application (SPA) built with **React** and **Vite**. It provides users with profile management, notification centers, and settings.
- **Admin Dashboard (ADMIN UI):** A separate, secure SPA built with **React** and **Vite** for administrators to oversee the platform, view analytics, and manage content.

## Folder Structure Explanation

| Directory | Description |
|-----------|-------------|
| **`server/`** | The complete backend API. Contains controllers, routes, database schemas (Prisma), email templates, and background workers. |
| **`USER UI/`** | The client-side application for end-users. Includes pages for login, dashboard, profile, and notification viewing. |
| **`ADMIN UI/`** | The client-side application for administrators. Includes refined interfaces for user management, broadcasting, and analytics. |

## Tech Stack

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB
- **ORM:** Prisma
- **Auth:** JWT, Bcrypt
- **External Services:** Firebase Admin (Push), Nodemailer (Email)
- **Utilities:** Node-cron (Scheduling), Multer (File Uploads)

### Frontend (User & Admin)
- **Framework:** React 19
- **Build Tool:** Vite
- **Styling:** Tailwind CSS 4
- **State/Networking:** Axios, React Context
- **Icons:** Lucide React
- **Notifications:** React Hot Toast
- **Push:** Firebase Client SDK

## How to Run the Project

### 1. Backend Setup

```bash
cd server
npm install

# Setup Env (Copy .env.example if available and fill values)
# Ensure DATABASE_URL is set for MongoDB

npx prisma generate
# Note: MongoDB does not require migrations like SQL, but you may need to push schema
npx prisma db push

# Seed Admin User
npm run seed:admin

# Start Development Server
npm run dev
```

### 2. USER UI Setup

```bash
cd "USER UI"
npm install
npm run dev
```

### 3. ADMIN UI Setup

```bash
cd "ADMIN UI"
npm install
npm run dev
```

## Environment Variables

### Server (`server/.env`)
```env
PORT=5000
DATABASE_URL="mongodb+srv://..."
JWT_SECRET="your_jwt_secret"
CLIENT_URL="http://localhost:5173,http://localhost:5174"
SMTP_HOST="smtp.example.com"
SMTP_PORT=587
SMTP_USER="user"
SMTP_PASS="pass"
FIREBASE_CREDENTIALS="..."
GOOGLE_CLIENT_ID="..."
GITHUB_CLIENT_ID="..."
```

### Frontend (`.env`)
```env
# Backend API URL
VITE_API_URL=http://localhost:5000/api

# Firebase Config (For Push Notifications)
VITE_FIREBASE_API_KEY="..."
VITE_FIREBASE_AUTH_DOMAIN="..."
VITE_FIREBASE_PROJECT_ID="..."
```

## API Base URL

The API is versioned and structured as follows:
- **Base URL:** `http://localhost:5000/api`
- **Auth:** `/api/auth`
- **User:** `/api/user`
- **Admin:** `/api/admin`
- **Push:** `/api/user/push`
