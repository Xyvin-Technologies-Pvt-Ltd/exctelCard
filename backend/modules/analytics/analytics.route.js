const express = require('express');
const { protect, authorize } = require('../../middlewares/auth');
const {
    getDashboard,
    getUserAnalytics,
    exportAnalytics,
    getRealTimeAnalytics,
    getAnalyticsSummary
} = require('./analytics.controller');

const router = express.Router();

// Apply protection to all routes
router.use(protect);

// Routes
router.get('/dashboard', authorize('admin', 'super_admin'), getDashboard);
router.get('/users/:userId', getUserAnalytics);
router.get('/export', authorize('admin', 'super_admin'), exportAnalytics);
router.get('/realtime', authorize('admin', 'super_admin'), getRealTimeAnalytics);
router.get('/summary', authorize('admin', 'super_admin'), getAnalyticsSummary);

module.exports = router; 