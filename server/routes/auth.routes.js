const express = require('express');
const router = express.Router();
const authController = require('../controller/authController');
// Updated to use verifyToken to match our middleware file and prevent crashes
const { verifyToken, isAdmin } = require('../middleware/authmiddleware');

// --- Public Authentication Routes ---

router.post('/register', authController.register);
router.post('/login', authController.login);

// Magic Link (Passwordless)
// Fixed: Changed sendMagicLink to magicLink to match the controller method exactly
router.post('/magic-link', authController.magicLink);
router.post('/verify-magic', authController.verifyMagicLink);

// Social Auth - INITIAL REDIRECT
router.get('/google', authController.googleAuth);
router.get('/github', authController.githubAuth);
router.get('/facebook', authController.facebookAuth);

// Social Auth - CALLBACKS
router.get('/google/callback', authController.googleCallback);
router.get('/github/callback', authController.githubCallback);
// Add verification route
router.post('/verify-email', authController.verifyEmail);
router.post('/resend-verification', authController.resendVerification); // Optional but helpful
// Password Recovery & Tokens
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/refresh', authController.refreshToken);

// --- Protected User Routes ---
// Fixed: Changed authenticateToken to verifyToken
router.post('/logout', verifyToken, authController.logout);
router.post('/change-password', verifyToken, authController.changePassword);
router.get('/profile', verifyToken, authController.getProfile);

// --- Admin Management Routes ---

router.get('/admin/users', verifyToken, isAdmin, async (req, res, next) => {
    try {
        // Dynamic import to avoid circular dependency
        const UserService = require('../src/core/services/UserService');
        const userService = new UserService();
        
        // Note: You may need to add getAllUsers to your UserService class
        const users = await userService.getUserStats(); 
        res.json({ success: true, users });
    } catch (error) {
        next(error); 
    }
});

router.get('/admin/stats', verifyToken, isAdmin, async (req, res, next) => {
    try {
        const UserService = require('../src/core/services/UserService');
        const userService = new UserService();
        const stats = await userService.getUserStats();
        res.json({ success: true, stats });
    } catch (error) {
        next(error);
    }
});

module.exports = router;