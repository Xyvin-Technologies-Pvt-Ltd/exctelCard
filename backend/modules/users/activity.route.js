const express = require("express");
const router = express.Router();
const activityController = require("./activity.controller");
const { authenticateToken } = require("../../middlewares/auth.middleware");

// Get all activities with optional filters
router.get("/", authenticateToken, activityController.getActivities);

// Get activity statistics
router.get("/stats", authenticateToken, activityController.getActivityStats);

// Get user-specific activity (for admin)
router.get(
  "/user/:userId",
  authenticateToken,
  activityController.getUserActivity
);

module.exports = router;
