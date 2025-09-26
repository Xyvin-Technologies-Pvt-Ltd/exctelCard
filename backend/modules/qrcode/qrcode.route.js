const express = require("express");
const router = express.Router();
const qrcodeController = require("./qrcode.controller");
const { authenticateToken } = require("../../middlewares/auth.middleware");

// All routes require authentication
router.use(authenticateToken);

// Get QR code history
router.get("/history", qrcodeController.getQRHistory);

// Generate new QR code
router.post("/generate", qrcodeController.generateQRCodeEndpoint);

// Update QR code
router.put("/:qrId", qrcodeController.updateQRCode);

// Delete QR code
router.delete("/:qrId", qrcodeController.deleteQRCode);

// Get QR code analytics
router.get("/:qrId/analytics", qrcodeController.getQRAnalytics);

// Track QR code scan (public route - no auth required)
router.post("/:shareId/scan", qrcodeController.trackQRScan);

module.exports = router;

