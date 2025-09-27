const express = require("express");
const router = express.Router();
const shareController = require("./share.controller");

// Public routes (no authentication required)
// Get shared profile by share ID
router.get("/:shareId", shareController.getSharedProfile);

// Track profile view (optional - for analytics)
router.post("/:shareId/view", shareController.trackProfileView);

// Download business card PDF
router.get("/:shareId/downloadBizCard", shareController.downloadBizCard);

module.exports = router;
