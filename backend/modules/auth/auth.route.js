const express = require('express');
const passport = require('passport');
const { protect, authorize } = require('../../middlewares/auth');
const {
    login,
    getMe,
    logout,
    googleCallback,
    microsoftCallback,
    createSuperAdmin,
    refreshToken
} = require('./auth.controller');

const router = express.Router();

// Public routes
router.post('/login', login);
router.post('/create-super-admin', createSuperAdmin);

// Google OAuth routes
router.get('/google',
    passport.authenticate('google', {
        scope: ['profile', 'email']
    })
);

router.get('/google/callback',
    passport.authenticate('google', {
        failureRedirect: `${process.env.FRONTEND_URL}/login?error=sso_failed`
    }),
    googleCallback
);

// Microsoft OAuth routes
router.get('/microsoft',
    passport.authenticate('microsoft', {
        scope: ['user.read']
    })
);

router.get('/microsoft/callback',
    passport.authenticate('microsoft', {
        failureRedirect: `${process.env.FRONTEND_URL}/login?error=sso_failed`
    }),
    microsoftCallback
);

// Protected routes
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);
router.post('/refresh', protect, refreshToken);

module.exports = router; 