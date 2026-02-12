# User Frontend Overview

The **USER UI** is a React-based single-page application that serves as the primary interface for standard users. It focuses on a clean, responsive design, ensuring a seamless experience for authentication, profile management, and interacting with system notifications.

## Folder Structure

- **`src/components/`**: Reusable UI components (Buttons, Inputs, Modals) and Layout wrappers (`DashboardLayout`).
- **`src/lib/`**: Utility libraries, API clients, and configuration.
  - `auth/`: Hooks (`useAuth`) and services for handling login/state.
  - `push/`: Firebase Cloud Messaging (FCM) integration handling.
- **`src/pages/`**: Main application routes (Login, Dashboard, Profile, Settings).
- **`public/firebase-messaging-sw.js`**: Service worker for handling background push notifications.

## Authentication Handling

- **JWT Management:** The application manages authentication state using JWTs stored securely.
- **Protected Routes:** The `ProtectedRoutes` component wraps secure pages, redirecting unauthenticated users to the login page.
- **Auto-Logout:** API interceptors (via Axios) automatically log the user out if a `401 Unauthorized` response is received from the backend.
- **Social Login:** dedicated methods handle the redirect flows for Google, GitHub, etc.

## Features

- **Authentication Suite:** Full Register, Login, Magic Link, and Password Forgot/Reset flows.
- **Dashboard:** Personal overview page.
- **Profile Management:** Users can update their bio, location, and upload profile pictures.
- **Notification Center:** Real-time view of in-app notifications with "Mark as Read" functionality.
- **Push Integration:** Automatic registration of device tokens for web push notifications.
- **Privacy Settings:** Management of email subscriptions.

## API Integration

The client communicates with the backend via a calibrated `axios` instance. Key endpoints consumed:

```javascript
// Auth
POST   /auth/login
POST   /auth/register

// User Data
GET    /user/profile
PATCH  /user/settings

// Notifications
GET    /user/notifications
POST   /user/push/register
```

## Environment Variables

Create a `.env` file in the `USER UI` directory:

```env
# Backend API URL
VITE_API_URL=http://localhost:5000/api

# Firebase Config (For Push Notifications)
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```
