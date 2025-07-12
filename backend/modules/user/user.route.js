const express = require('express');
const { protect, authorize, optionalAuth } = require('../../middlewares/auth');
const {
    getUsers,
    getUser,
    updateUser,
    toggleCardAccess,
    getUserCard,
    updateCardSettings,
    getUserAnalytics,
    deleteUser
} = require('./user.controller');

const router = express.Router();

// Apply protection to all routes
router.use(protect);

// Routes
router.route('/')
    .get(authorize('admin', 'super_admin'), getUsers);

router.route('/:id')
    .get(getUser)
    .put(updateUser)
    .delete(authorize('admin', 'super_admin'), deleteUser);

router.route('/:id/card')
    .get(optionalAuth, getUserCard);

router.route('/:id/card-access')
    .put(authorize('admin', 'super_admin'), toggleCardAccess);

router.route('/:id/card-settings')
    .put(updateCardSettings);

router.route('/:id/analytics')
    .get(getUserAnalytics);

module.exports = router; 