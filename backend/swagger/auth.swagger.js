/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique user identifier from Azure AD
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *         name:
 *           type: string
 *           description: User's display name
 *         tenantId:
 *           type: string
 *           description: Azure AD tenant ID
 *       example:
 *         id: "12345678-1234-1234-1234-123456789abc"
 *         email: "user@example.com"
 *         name: "John Doe"
 *         tenantId: "87654321-4321-4321-4321-cba987654321"
 *
 *     AuthResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Indicates if the operation was successful
 *         message:
 *           type: string
 *           description: Response message
 *         authUrl:
 *           type: string
 *           description: Azure AD authentication URL (for login endpoint)
 *         logoutUrl:
 *           type: string
 *           description: Azure AD logout URL (for logout endpoint)
 *         user:
 *           $ref: '#/components/schemas/User'
 *       example:
 *         success: true
 *         message: "Operation successful"
 *         authUrl: "https://login.microsoftonline.com/..."
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           description: Error message
 *         error:
 *           type: string
 *           description: Detailed error information
 *       example:
 *         success: false
 *         message: "Authentication failed"
 *         error: "Invalid token"
 */

module.exports = {};
