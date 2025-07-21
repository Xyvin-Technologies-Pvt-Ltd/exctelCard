const express = require("express");
const router = express.Router();
const adminController = require("./admin.controller");
const {
  authenticateToken,
  requireAdmin,
} = require("../../middlewares/auth.middleware");

// Apply authentication middleware to all admin routes
router.use(authenticateToken);
router.use(requireAdmin);

// Dashboard routes
router.get("/dashboard/stats", adminController.getDashboardStats);

// User management routes
router.get("/users", adminController.getUsers);
router.get("/users/search", adminController.searchUsers);
router.get("/users/:userId/activity", adminController.getUserActivity);
router.put("/users/:userId/status", adminController.updateUserStatus);

// SSO configuration routes
router.get("/sso/configurations", adminController.getSSOConfigurations);
router.post("/sso/configurations", adminController.saveSSOConfiguration);
router.post("/sso/configurations/test", adminController.testSSOConfiguration);

// Analytics routes
router.get("/analytics", adminController.getSystemAnalytics);

module.exports = router;
