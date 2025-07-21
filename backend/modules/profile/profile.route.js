const express = require("express");
const router = express.Router();
const profileController = require("./profile.controller");
const { authenticateToken } = require("../../middlewares/auth.middleware");

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Get user profile
router.get("/", profileController.getProfile);

// Update user profile
router.put("/", profileController.updateProfile);

// Generate share ID
router.post("/share-id", profileController.generateShareId);

// Sync profile with SSO data
router.post("/sync", profileController.syncProfile);

module.exports = router;
