const jwt = require("jsonwebtoken");

/**
 * Middleware to authenticate JWT token
 */
const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access token is required",
      });
    }
    jwt.verify(
      token,
      process.env.JWT_SECRET || "your-jwt-secret",
      (err, user) => {
        if (err) {
          console.log(err)
          return res.status(403).json({
            success: false,
            message: "Invalid or expired token",
          });
        }

        req.user = user;
        next();
      }
    );
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(500).json({
      success: false,
      message: "Authentication failed",
      error: error.message,
    });
  }
};

/**
 * Middleware to check if user is admin
 */
const requireAdmin = (req, res, next) => {
  try {
    console.log('sad',req.user)

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    console.log("🔍 Checking admin access for user:", {
      userId: req.user.userId,
      email: req.user.email,
      role: req.user.role,
      loginType: req.user.loginType,
    });

    // Check if user has admin role
    if (req.user.role === "admin" || req.user.role === "super_admin") {
      console.log("✅ Admin access granted");
      return next();
    }

    // Fallback: Check if user email is in admin emails (for backward compatibility)
    const adminEmails = process.env.ADMIN_EMAILS
      ? process.env.ADMIN_EMAILS.split(",").map((email) => email.trim())
      : [];

    if (adminEmails.includes(req.user.email)) {
      console.log("✅ Admin access granted via email list");
      return next();
    }
    console.log("❌ Admin access denied");
    return res.status(403).json({
      success: false,
      message:
        "Admin access required. Only administrators can access this resource.",
    });
  } catch (error) {
    console.error("❌ Admin check error:", error);
    res.status(500).json({
      success: false,
      message: "Authorization failed",
      error: error.message,
    });
  }
};

/**
 * Optional authentication middleware (doesn't fail if no token)
 */
const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (token) {
      jwt.verify(
        token,
        process.env.JWT_SECRET || "your-jwt-secret",
        (err, user) => {
          if (!err) {
            req.user = user;
          }
        }
      );
    }

    next();
  } catch (error) {
    // Don't fail, just continue without user context
    next();
  }
};

module.exports = {
  authenticateToken,
  requireAdmin,
  optionalAuth,
};
