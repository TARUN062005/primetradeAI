const express = require('express');
const router = express.Router();
const adminController = require('../controller/adminController');
const { verifyToken, isAdmin } = require('../middleware/authmiddleware');

// -------------------- PUBLIC ADMIN ROUTES --------------------
router.post('/login', adminController.login);

// -------------------- PROTECTED ADMIN ROUTES --------------------
router.use(verifyToken);
router.use(isAdmin);

// Admin profile
router.get('/me', adminController.getMe);
router.get('/profile', adminController.getAdminProfile);
router.put('/profile', adminController.updateAdminProfile);
router.post('/profile/avatar', adminController.uploadAvatar);
router.delete('/profile/avatar', adminController.removeAvatar);
router.put('/profile/password', adminController.changeAdminPassword);
router.get('/profile/sessions', adminController.getAdminSessions);
router.delete('/profile/sessions/:sessionId', adminController.revokeAdminSession);
router.put('/profile/preferences', adminController.updateAdminPreferences);
router.get('/profile/activity', adminController.getAdminActivity);
router.get('/profile/stats', adminController.getAdminProfileStats);

// Admin permissions (super admin only)
router.get('/permissions', adminController.getAdminPermissions);
router.put('/permissions/:adminId', adminController.updateAdminPermissions);

// User management
router.get('/users', adminController.getAllUsers);
router.get('/users/:id', adminController.getUserById);
router.get('/users/:id/activity', adminController.getUserActivity);
router.patch('/users/:id/suspend', adminController.suspendUser);
router.patch('/users/:id/reactivate', adminController.reactivateUser);
router.patch('/users/:id/role', adminController.changeUserRole);
router.delete('/users/:id', adminController.deleteUser);

// -------------------- NOTIFICATIONS / BROADCAST (UPDATED) --------------------

// fetch notification list with filters
router.get('/notifications', adminController.getAllNotifications);
// get single notification with stats
router.get('/notifications/:id', adminController.getNotificationById);
// update notification (cancel scheduled, etc.)
router.patch('/notifications/:id', adminController.updateNotification);
// delete notification
router.delete('/notifications/:id', adminController.deleteNotification);

// old routes kept (backward compatible)
router.post('/notifications/broadcast', adminController.sendBroadcastNotification);
router.post('/notifications/user/:id', adminController.sendNotificationToUser);

// Email broadcast (old route)
router.post('/email/broadcast', adminController.sendBroadcastEmail);

// NEW unified broadcast route (recommended) - UPDATED
router.post('/broadcast/send', adminController.sendBroadcast);

// Scheduled broadcasts management
router.get('/broadcast/scheduled', adminController.getScheduledBroadcasts);
router.delete('/broadcast/scheduled/:id', adminController.cancelScheduledBroadcast);

// Email templates
router.get('/email-templates', adminController.getEmailTemplates);
router.post('/email-templates', adminController.createEmailTemplate);
router.put('/email-templates/:id', adminController.updateEmailTemplate);
router.delete('/email-templates/:id', adminController.deleteEmailTemplate);

// Delivery analytics
router.get('/broadcast/analytics/:id', adminController.getBroadcastAnalytics);
router.get('/broadcast/analytics', adminController.getAllBroadcastAnalytics);

// Stats & Audit
router.get('/stats', adminController.getAdminStats);
router.get('/audit', adminController.getAuditLogs);

module.exports = router;