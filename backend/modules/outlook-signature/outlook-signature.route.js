const express = require("express");
const router = express.Router();
const outlookSignatureController = require("./outlook-signature.controller");
const { authenticateToken, requireAdmin } = require("../../middlewares/auth.middleware");

// Most routes require authentication
router.use((req, res, next) => {
  // Skip auth for manifest and commands endpoints (Outlook needs public access)
  if (req.path.startsWith('/manifest/') || 
      req.path.startsWith('/commands/') ||
      req.path === '/manifest-universal' ||
      req.path === '/commands-universal' ||
      req.path === '/commands-universal.js') {
    return next();
  }
  // Apply auth for all other routes
  authenticateToken(req, res, next);
});

/**
 * @route   GET /api/outlook-signature/configs
 * @desc    Get all signature configs for user
 * @access  Private
 */
router.get("/configs", outlookSignatureController.getAllConfigs);

/**
 * @route   GET /api/outlook-signature/configs/:id
 * @desc    Get specific signature config
 * @access  Private
 */
router.get("/configs/:id", outlookSignatureController.getConfigById);

/**
 * @route   POST /api/outlook-signature/configs
 * @desc    Create new signature config
 * @access  Private
 */
router.post("/configs", outlookSignatureController.createConfig);

/**
 * @route   PUT /api/outlook-signature/configs/:id
 * @desc    Update signature config
 * @access  Private
 */
router.put("/configs/:id", outlookSignatureController.updateConfig);

/**
 * @route   DELETE /api/outlook-signature/configs/:id
 * @desc    Delete signature config
 * @access  Private
 */
router.delete("/configs/:id", outlookSignatureController.deleteConfig);

/**
 * @route   POST /api/outlook-signature/preview
 * @desc    Generate HTML preview from template
 * @access  Private
 */
router.post("/preview", outlookSignatureController.generatePreview);

/**
 * @route   GET /api/outlook-signature/generate-addin/:id
 * @desc    Generate Outlook Add-in manifest and code files
 * @access  Private
 */
router.get("/generate-addin/:id", outlookSignatureController.generateAddin);

/**
 * @route   GET /api/outlook-signature/manifest/:id
 * @desc    Serve manifest.xml file for Outlook add-in
 * @access  Public (for Outlook to fetch)
 */
router.get("/manifest/:id", outlookSignatureController.serveManifest);

/**
 * @route   GET /api/outlook-signature/commands/:id
 * @desc    Serve commands.html file for Outlook add-in
 * @access  Public (for Outlook to fetch)
 */
router.get("/commands/:id", outlookSignatureController.serveCommands);

/**
 * @route   GET /api/outlook-signature/generate-admin-addin
 * @desc    Generate universal admin add-in (works for all users)
 * @access  Private (admin only)
 */
router.get("/generate-admin-addin", outlookSignatureController.generateAdminAddin);

/**
 * @route   GET /api/outlook-signature/manifest-universal
 * @desc    Serve universal manifest.xml file for admin installation
 * @access  Public (for Outlook to fetch)
 */
router.get("/manifest-universal", outlookSignatureController.serveUniversalManifest);
router.options("/manifest-universal", (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.sendStatus(204);
});

/**
 * @route   GET /api/outlook-signature/commands-universal
 * @desc    Serve universal commands.html file (works for all users)
 * @access  Public (for Outlook to fetch)
 */
router.get("/commands-universal", outlookSignatureController.serveUniversalCommands);
router.options("/commands-universal", (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.sendStatus(204);
});

/**
 * @route   GET /api/outlook-signature/commands-universal.js
 * @desc    Serve universal commands.js file (raw JavaScript for Runtime override)
 * @access  Public (for Outlook to fetch)
 */
router.get("/commands-universal.js", outlookSignatureController.serveUniversalCommandsJs);
router.options("/commands-universal.js", (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.sendStatus(204);
});

/**
 * @route   GET /api/outlook-signature/user-config
 * @desc    Get user's signature config by Azure AD token (for universal add-in)
 * @access  Private (requires valid Azure AD token)
 */
router.get("/user-config", outlookSignatureController.getUserSignatureConfig);

/**
 * Admin Routes - Require admin authentication
 */

/**
 * @route   GET /api/outlook-signature/admin/configs
 * @desc    Get all signature configs for all users (admin only)
 * @access  Private (admin only)
 */
router.get("/admin/configs", requireAdmin, outlookSignatureController.getAllConfigsAdmin);

/**
 * @route   GET /api/outlook-signature/admin/configs/user/:userId
 * @desc    Get all signature configs for a specific user (admin only)
 * @access  Private (admin only)
 */
router.get("/admin/configs/user/:userId", requireAdmin, outlookSignatureController.getUserConfigsAdmin);

/**
 * @route   POST /api/outlook-signature/admin/configs
 * @desc    Create signature config for any user (admin only)
 * @access  Private (admin only)
 */
router.post("/admin/configs", requireAdmin, outlookSignatureController.createConfigAdmin);

/**
 * @route   PUT /api/outlook-signature/admin/configs/:id
 * @desc    Update signature config for any user (admin only)
 * @access  Private (admin only)
 */
router.put("/admin/configs/:id", requireAdmin, outlookSignatureController.updateConfigAdmin);

/**
 * @route   DELETE /api/outlook-signature/admin/configs/:id
 * @desc    Delete signature config for any user (admin only)
 * @access  Private (admin only)
 */
router.delete("/admin/configs/:id", requireAdmin, outlookSignatureController.deleteConfigAdmin);

module.exports = router;

