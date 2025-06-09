const express = require("express");
const router = express.Router();
const authController = require("./auth.controller");
const { authenticateToken } = require("../../middlewares/auth.middleware");

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: Azure AD SSO authentication endpoints
 */

/**
 * @swagger
 * /api/auth/login:
 *   get:
 *     summary: Initiate SSO login process
 *     tags: [Authentication]
 *     description: Returns Azure AD authentication URL for user to login
 *     responses:
 *       200:
 *         description: Successfully generated auth URL
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 authUrl:
 *                   type: string
 *                 message:
 *                   type: string
 *       500:
 *         description: Internal server error
 */
router.get("/login", authController.initiateLogin);

/**
 * @swagger
 * /api/auth/callback:
 *   get:
 *     summary: Handle OAuth callback from Azure AD
 *     tags: [Authentication]
 *     description: Processes the OAuth callback and exchanges code for tokens
 *     parameters:
 *       - in: query
 *         name: code
 *         schema:
 *           type: string
 *         description: Authorization code from Azure AD
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *         description: State parameter for security validation
 *     responses:
 *       302:
 *         description: Redirects to frontend with authentication result
 */
router.get("/callback", authController.handleCallback);

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Get current user profile
 *     tags: [Authentication]
 *     description: Returns the authenticated user's profile information
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     name:
 *                       type: string
 *                     tenantId:
 *                       type: string
 *       401:
 *         description: User not authenticated
 */
router.get("/profile", authenticateToken, authController.getProfile);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Authentication]
 *     description: Logs out the user and returns Azure AD logout URL
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 logoutUrl:
 *                   type: string
 *                 message:
 *                   type: string
 *       500:
 *         description: Internal server error
 */
router.post("/logout", authenticateToken, authController.logout);

/**
 * @swagger
 * /api/auth/verify:
 *   post:
 *     summary: Verify JWT token
 *     tags: [Authentication]
 *     description: Verifies the provided JWT token and returns user information
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token is valid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 user:
 *                   type: object
 *                 message:
 *                   type: string
 *       401:
 *         description: Invalid or missing token
 */
router.post("/verify", authController.verifyToken);

/**
 * @swagger
 * /api/auth/admin/login:
 *   post:
 *     summary: Admin login with email and password
 *     tags: [Authentication]
 *     description: Allows super admin to login using email/password credentials
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Admin email address
 *               password:
 *                 type: string
 *                 description: Admin password
 *     responses:
 *       200:
 *         description: Admin login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 token:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     name:
 *                       type: string
 *                     role:
 *                       type: string
 *                       enum: [admin]
 *       401:
 *         description: Invalid credentials
 *       400:
 *         description: Missing email or password
 */
router.post("/admin/login", authController.adminLogin);

/**
 * @swagger
 * /api/auth/debug:
 *   get:
 *     summary: Debug active sessions (development only)
 *     tags: [Authentication]
 *     description: Shows active authentication sessions for debugging
 *     responses:
 *       200:
 *         description: Debug information
 *       404:
 *         description: Not available in production
 */
router.get("/debug", authController.debugSessions);

module.exports = router;
