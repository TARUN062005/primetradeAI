# Backend Overview

The server is a robust Node.js application using Express and Prisma. It is designed to be modular, scalable, and secure, serving as the central hub for the Primetrade AI platform.

## Directory Breakdown

- **`controller/`**: Contains business logic for handling requests (Auth, User, Admin, Push).
- **`routes/`**: Defines API endpoints and maps them to controllers.
- **`middleware/`**: Custom middleware for Authentication (`verifyToken`, `isAdmin`), File Uploads, and Error Handling.
- **`prisma/`**: Database schema definition and client generation.
- **`src/core/`**: Core business services (`AuthManager`, `UserService`, `EmailService`).
- **`utils/`**: Helper functions, DB connectors, Cron jobs (`broadcastScheduler`), and Firebase helpers.
- **`templates/emails/`**: EJS templates for system emails (Welcome, OTP, Password Reset).
- **`firebase/`**: Service account credentials.
- **`uploads/`**: Directory for storing user-uploaded content (avatars).
- **`scripts/`**: Utility scripts (e.g., seeding admin users).

## Authentication Flow

1.  **Registration**: Users sign up via Email/Password or Social Providers (Google, GitHub, Facebook).
2.  **Verification**: Email verification links or OTPs are sent to confirm identity.
3.  **Login**: Supports standard login and Magic Link (passwordless).
4.  **Token Issue**: Upon success, a JWT is issued.
5.  **Protection**: The `verifyToken` middleware intercepts protected routes, validates the JWT, and attaches the user to the request object.
6.  **RBAC**: The `isAdmin` middleware ensures only users with the `ADMIN` role access sensitive endpoints.

## Complete API Documentation

### Auth Routes (`/api/auth`)

```markdown
POST   /register             - Register a new user
POST   /login                - Authenticate user & get token
POST   /magic-link           - Request a passwordless login link
POST   /verify-magic         - Verify magic link token
GET    /google               - Initiate Google login
GET    /github               - Initiate GitHub login
GET    /facebook             - Initiate Facebook login
GET    /:provider/callback   - Handle social login callback
POST   /verify-email         - Verify user email address
POST   /forgot-password      - Request password reset email
POST   /reset-password       - Reset password using token
POST   /logout               - Invalidate session (Auth Required)
GET    /profile              - Get current user's auth profile (Auth Required)
```

### User Routes (`/api/user`)

```markdown
GET    /profile                   - Fetch full user profile details (Auth Required)
PATCH  /settings                  - Update profile (Bio, Name) & Avatar (Auth Required)
GET    /activity                  - View account activity logs (Auth Required)
DELETE /account                   - Suspend or delete account (Auth Required)
GET    /notifications             - List user notifications (Auth Required)
PATCH  /notifications/read-all    - Mark all notifications as read (Auth Required)
PATCH  /notifications/:id/read    - Mark specific notification as read (Auth Required)
POST   /notifications/:id/click   - Track notification CTA click (Auth Required)
PATCH  /email/subscription        - Update email subscription (Auth Required)
GET    /email/subscription        - Get email subscription status (Auth Required)
```

### Admin Routes (`/api/admin`)

```markdown
POST   /login                           - Admin dedicated login
GET    /me                              - Get admin identity (Admin Auth)
GET    /users                           - List all users with pagination (Admin Auth)
GET    /users/:id                       - Get single user details (Admin Auth)
PATCH  /users/:id/suspend               - Suspend a user (Admin Auth)
PATCH  /users/:id/reactivate            - Reactivate a user (Admin Auth)
PATCH  /users/:id/role                  - Promote/Demote user role (Admin Auth)
DELETE /users/:id                       - Permanently delete user (Admin Auth)
POST   /broadcast/send                  - Send/Schedule Broadcast (Email/Push/In-App) (Admin Auth)
GET    /broadcast/scheduled             - List pending broadcasts (Admin Auth)
DELETE /broadcast/scheduled/:id         - Cancel scheduled broadcast (Admin Auth)
GET    /broadcast/analytics             - View delivery stats (Admin Auth)
GET    /audit                           - View admin audit logs (Admin Auth)
GET    /stats                           - System-wide statistics (Admin Auth)
```

### Push Routes (`/api/user/push`)

```markdown
POST   /register   - Register FCM device token (Auth Required)
DELETE /remove     - Remove FCM device token (Auth Required)
```

## Database Schema Overview

The application uses **MongoDB** via Prisma. Key models include:

- **User**: Stores profile, auth (social/local), role (`USER`/`ADMIN`), and status.
- **Session**: Manages active user sessions.
- **PushToken**: Stores FCM tokens for multi-device push notifications (`WEB`, `ANDROID`, `IOS`).
- **Notification**: Central entity for all notifications (System, Marketing) with support for scheduling.
- **UserNotification**: Join table/Model for tracking individual user read status.
- **DeliveryTracking**: Analytics table for tracking sent/delivered/opened status of broadcasts.
- **AdminAuditLog**: Security log tracking administrative actions (e.g., Ban User, Send Broadcast).
- **EmailTemplate**: Stores dynamic EJS templates for email campaigns.

## Security Practices

- **JWT Authentication:** Stateless, scalable session management.
- **Bcrypt:** Strong password hashing.
- **Rate Limiting:** `express-rate-limit` applied to auth and API routes.
- **Helmet:** Sets secure HTTP headers (CSP, XSS protection).
- **Input Validation:** Employed at the controller level.
- **CORS:** Configurable origin through environment variables.

## Scalability Notes

- **Stateless Architecture:** JWT allows horizontal scaling of API nodes.
- **Background Processing:** `BroadcastScheduler` handles heavy lifting for notifications, decoupling it from the main request loop.
- **Database:** MongoDB handles large datasets and flexible schemas well.
- **Future Ready:** Architecture supports plugging in Redis for caching or message queues easily.
