const express = require("express");
const router = express.Router();
const authController = require("./auth.controller");
const { authenticateToken } = require("../../middlewares/auth.middleware");

router.get("/login", authController.initiateLogin);
router.get("/callback", authController.handleCallback);
router.get("/profile", authenticateToken, authController.getProfile);
router.post("/logout", authenticateToken, authController.logout);
router.post("/verify", authController.verifyToken);
router.post("/admin/login", authController.adminLogin);
router.get("/debug", authController.debugSessions);

module.exports = router;
