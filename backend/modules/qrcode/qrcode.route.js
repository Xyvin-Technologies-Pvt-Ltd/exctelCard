const express = require("express");
const router = express.Router();
const qrcodeController = require("./qrcode.controller");
const { authenticateToken } = require("../../middlewares/auth.middleware");

// Public routes (no auth required)


// // Protected routes (auth required)
// router.use(authenticateToken);

// Get user's QR code (from user model)
router.get("/share/:shareId", qrcodeController.downloadQRCode);
// // Download user's QR code
// router.get("/user/download", qrcodeController.downloadUserQRCode);

module.exports = router;
