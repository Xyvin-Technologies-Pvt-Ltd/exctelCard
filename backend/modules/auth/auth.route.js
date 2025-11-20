const express = require("express");
const router = express.Router();
const authController = require("./auth.controller");
const { authenticateToken, requireAdmin } = require("../../middlewares/auth.middleware");

// Public routes
router.get("/login", authController.initiateLogin);
router.get("/callback", authController.handleCallback);
router.post("/verify", authController.verifyToken);
router.post("/admin/login", authController.adminLogin);

// Protected routes
router.get("/profile", authenticateToken, authController.getProfile);
router.post("/logout", authenticateToken, authController.logout);

// Admin-only routes for auto-sync
router.post("/sync/users", authenticateToken, authController.autoSyncUsers);
router.get("/sync/status", authenticateToken, authController.getSyncStatus);

// Admin-only routes for user management
router.get("/admin/entra-users/all", authenticateToken, requireAdmin, authController.getAllEntraUsers);
router.post("/admin/entra-users/assign", authenticateToken, requireAdmin, authController.assignUsersToApp);
router.post("/admin/entra-users/remove", authenticateToken, requireAdmin, authController.removeUsersFromApp);

module.exports = router;
