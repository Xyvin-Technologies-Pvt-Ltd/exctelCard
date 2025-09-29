const express = require("express");
const router = express.Router();
const authController = require("./auth.controller");
const { authenticateToken } = require("../../middlewares/auth.middleware");

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

module.exports = router;
