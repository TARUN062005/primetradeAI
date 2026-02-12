# Admin Dashboard Overview

The **ADMIN UI** is a specialized React application designed for platform administrators. It provides high-level control over the system, including user oversight, communication tools, and system analytics.

## Folder Structure

- **`src/layouts/`**: `AdminLayout` structure ensuring navigation consistency.
- **`src/lib/admin/`**: Admin-specific API calls (`adminApi.js`) and auth utilities (`adminAuth.js`).
- **`src/pages/admin/`**:
  - `AdminDashboard`: Stats and overview.
  - `ManageUsers`: Grid view for user operations (Ban/Promote).
  - `AdminBroadcast`: Interface for creating and scheduling messages.
  - `AdminAudit`: View logs of admin actions.

## Admin Authentication

- **Distinct Flow:** Uses a separate login endpoint (`/api/admin/login`) to ensure separation of concerns.
- **Role Verification:** Client-side checks ensure only users with the `ADMIN` role can access functionality.
- **Session Security:** Supports explicit session revocation.

## Features

- **Dashboard:** Visual statistics of user growth and system activity.
- **User Management:**
  - View all users with search/filter.
  - Suspend/Reactivate user accounts.
  - Promote users to Admin role.
- **Broadcast System:**
  - Send messages via Email, Push, or In-App.
  - Schedule messages for future delivery.
  - Rich text editing for email templates.
- **Analytics:** View delivery rates (Sent vs Opened) for broadcasts.
- **Audit Logs:** Track who did what and when for accountability.

## API Endpoints Used

The dashboard heavily relies on the `/api/admin` namespace:

```javascript
// User Management
GET    /api/admin/users
PATCH  /api/admin/users/:id/suspend

// Broadcasts
POST   /api/admin/broadcast/send
GET    /api/admin/broadcast/scheduled

// Analytics
GET    /api/admin/stats
GET    /api/admin/audit
```

## Security

- **Middleware Enforcement:** Backend ensures strictly `ADMIN` role access.
- **Token Handling:** Secure storage of admin tokens.
- **Automatic Expiry:** Sessions adhere to backend expiry times.
