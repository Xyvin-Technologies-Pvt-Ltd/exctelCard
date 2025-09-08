const { ConfidentialClientApplication } = require("@azure/msal-node");
const jwt = require("jsonwebtoken");

const {
  azureConfig,
  redirectUri,
  postLogoutRedirectUri,
} = require("../../config/azureConfig");
const User = require("../users/user.model");
const UserActivity = require("../users/userActivity.model");
const bcrypt = require("bcrypt");

// Initialize MSAL instance
const msalInstance = new ConfidentialClientApplication(azureConfig);

// Session storage for auth state (in production, use Redis or database)
const authSessions = new Map();

/**
 * Initiate SSO login process
 */
const initiateLogin = async (req, res) => {
  try {
    console.log("🔄 Initiating SSO login...");

    // Generate a unique state parameter for security
    const state = require("crypto").randomBytes(16).toString("hex");

    // Store state in session (replace with Redis in production)
    const sessionData = {
      timestamp: Date.now(),
      sessionId: req.sessionID || state,
      userAgent: req.get("User-Agent") || "unknown",
    };

    authSessions.set(state, sessionData);

    // Clean up old sessions (older than 10 minutes)
    const now = Date.now();
    const tenMinutes = 10 * 60 * 1000;
    for (const [key, value] of authSessions.entries()) {
      if (now - value.timestamp > tenMinutes) {
        authSessions.delete(key);
        console.log("🧹 Cleaned up old session:", key.substring(0, 8) + "...");
      }
    }

    console.log("🔍 Login state created:", {
      state: state.substring(0, 8) + "...",
      sessionsCount: authSessions.size,
      redirectUri,
    });

    const authCodeUrlParameters = {
      scopes: ["openid", "profile", "email", "User.Read"],
      redirectUri: redirectUri,
      state: state,
      prompt: "select_account",
    };

    // Get the authorization URL
    const authUrl = await msalInstance.getAuthCodeUrl(authCodeUrlParameters);

    console.log("✅ Auth URL generated successfully");
    console.log("🔍 Redirect URI used:", redirectUri);

    res.json({
      success: true,
      authUrl: authUrl,
      message: "Redirect to Azure AD for authentication",
    });
  } catch (error) {
    console.error("❌ Error initiating login:", error);
    res.status(500).json({
      success: false,
      message: "Failed to initiate login",
      error: error.message,
    });
  }
};

/**
 * Handle OAuth callback from Azure AD
 */
const handleCallback = async (req, res) => {
  try {
    const { code, state, error, error_description } = req.query;

    console.log("🔍 Callback received with params:", {
      code: code ? "Present" : "Missing",
      state: state ? state.substring(0, 8) + "..." : "Missing",
      error: error || "None",
    });

    // Check for OAuth errors
    if (error) {
      console.error("❌ OAuth error:", error, error_description);
      return res.redirect(
        `${
          process.env.FRONTEND_URL|| "http://localhost:5173"
        }/login?error=${encodeURIComponent(error_description || error)}`
      );
    }

    // Debug state validation
    console.log("🔍 State validation:");
    console.log(
      "  - Received state:",
      state ? state.substring(0, 8) + "..." : "None"
    );
    console.log("  - Active sessions count:", authSessions.size);
    console.log(
      "  - Session keys:",
      Array.from(authSessions.keys()).map((k) => k.substring(0, 8) + "...")
    );

    // Validate state parameter - be more lenient in development
    if (!state) {
      console.error("❌ No state parameter received");
      return res.redirect(
        `${
          process.env.FRONTEND_URL|| "http://localhost:5173"
        }/login?error=missing_state`
      );
    }

    if (!authSessions.has(state)) {
      console.error("❌ State not found in sessions");
      console.log(
        "🔄 Available states:",
        Array.from(authSessions.keys()).map((k) => k.substring(0, 8) + "...")
      );

      // In development, we'll be more forgiving and proceed anyway
      if (process.env.NODE_ENV === "development") {
        console.log("⚠️ Development mode: proceeding despite invalid state");
      } else {
        return res.redirect(
          `${
            process.env.FRONTEND_URL|| "http://localhost:5173"
          }/login?error=invalid_state`
        );
      }
    } else {
      // Remove used state
      authSessions.delete(state);
      console.log("✅ State validated and removed");
    }

    if (!code) {
      return res.redirect(
        `${
          process.env.FRONTEND_URL|| "http://localhost:5173"
        }/login?error=no_authorization_code`
      );
    }

    const tokenRequest = {
      code: code,
      scopes: ["openid", "profile", "email", "User.Read"],
      redirectUri: redirectUri,
    };

    // Exchange code for tokens
    const response = await msalInstance.acquireTokenByCode(tokenRequest);

    // Extract user information from Azure AD response
    const azureUserInfo = {
      entraId: response.account.homeAccountId,
      email: response.account.username,
      name: response.account.name,
      tenantId: response.account.tenantId,
      accessToken: response.accessToken,
      idToken: response.idToken,
    };

    console.log("👤 Azure AD user info:", {
      entraId: azureUserInfo.entraId,
      email: azureUserInfo.email,
      name: azureUserInfo.name,
      tenantId: azureUserInfo.tenantId,
    });

    // Find or create user in our database
    let user = await User.findOne({ email: azureUserInfo.email });

    if (!user) {
      console.log("🆕 Creating new user in database...");

      // Create new user from Azure AD data
      user = new User({
        entraId: azureUserInfo.entraId,
        email: azureUserInfo.email,
        name: azureUserInfo.name,
        tenantId: azureUserInfo.tenantId,
        role: "user",
        loginType: "sso",
        isActive: true,
        isEmailVerified: true,
        createdBy: "sso",
        lastLoginAt: new Date(),
        loginCount: 1,
      });

      await user.save();
      console.log("✅ New user created:", user._id);
    } else {
      console.log("👤 Existing user found, updating login info...");

      // Update existing user login info
      await user.updateLastLogin();
      console.log("✅ User login info updated");
    }

    // Track login activity
    await UserActivity.trackActivity({
      userId: user._id,
      activityType: "login",
      source: "sso",
      visitorInfo: {
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
      },
      metadata: {
        provider: "microsoft",
        tenantId: azureUserInfo.tenantId,
      },
    });

    // Generate JWT token for our application
    const jwt = require("jsonwebtoken");
    const appToken = jwt.sign(
      {
        userId: user._id, // Use our database user ID
        email: user.email,
        name: user.name,
        tenantId: user.tenantId,
        role: user.role,
        loginType: user.loginType,
      },
      process.env.JWT_SECRET || "your-jwt-secret",
      { expiresIn: "24h" }
    );

    // Store user session (replace with database in production)
    req.session = req.session || {};
    req.session.user = {
      _id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      tenantId: user.tenantId,
      loginType: user.loginType,
    };
    req.session.token = appToken;

    // Redirect to frontend login page with token for processing
    res.redirect(
      `${
        process.env.FRONTEND_URL || "https://exctelcard.xyvin.com"
      }/login?token=${appToken}`
    );
  } catch (error) {
    console.error("Error handling callback:", error);
    res.redirect(
      `${
        process.env.FRONTEND_URL|| "http://localhost:5173"
      }/login?error=authentication_failed`
    );
  }
};

/**
 * Get current user profile
 */
const getProfile = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    res.json({
      success: true,
      user: {
        id: req.user.userId,
        email: req.user.email,
        name: req.user.name,
        tenantId: req.user.tenantId,
      },
    });
  } catch (error) {
    console.error("Error getting profile:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get user profile",
      error: error.message,
    });
  }
};

/**
 * Logout user
 */
const logout = async (req, res) => {
  try {
    // Clear session
    if (req.session) {
      req.session.destroy();
    }

    // Generate logout URL
    const logoutUrl = `https://login.microsoftonline.com/${
      process.env.AZURE_TENANT_ID
    }/oauth2/v2.0/logout?post_logout_redirect_uri=${encodeURIComponent(
      postLogoutRedirectUri
    )}`;

    res.json({
      success: true,
      logoutUrl: logoutUrl,
      message: "Logout successful",
    });
  } catch (error) {
    console.error("Error during logout:", error);
    res.status(500).json({
      success: false,
      message: "Failed to logout",
      error: error.message,
    });
  }
};

/**
 * Verify token and get user info (for API authentication)
 */
const verifyToken = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    const jwt = require("jsonwebtoken");
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-jwt-secret"
    );

    res.json({
      success: true,
      user: decoded,
      message: "Token is valid",
    });
  } catch (error) {
    console.error("Error verifying token:", error);
    res.status(401).json({
      success: false,
      message: "Invalid token",
      error: error.message,
    });
  }
};

/**
 * Debug endpoint to show active sessions (development only)
 */
const debugSessions = async (req, res) => {
  if (process.env.NODE_ENV !== "development") {
    return res.status(404).json({ message: "Not found" });
  }

  const sessions = [];
  for (const [state, data] of authSessions.entries()) {
    sessions.push({
      state: state.substring(0, 8) + "...",
      timestamp: new Date(data.timestamp).toISOString(),
      age: Math.round((Date.now() - data.timestamp) / 1000) + "s",
      sessionId: data.sessionId?.substring(0, 8) + "..." || "none",
    });
  }

  res.json({
    success: true,
    message: "Active authentication sessions",
    data: {
      totalSessions: authSessions.size,
      sessions: sessions,
      nodeEnv: process.env.NODE_ENV,
      redirectUri: redirectUri,
      timestamp: new Date().toISOString(),
    },
  });
};

/**
 * Admin login with email and password
 */
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("🔄 Admin login attempt for:", email);

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Find admin user in database
    const adminUser = await User.findOne({
      email: email,
      role: "admin",
      isActive: true,
    });

    if (!adminUser) {
      console.error("❌ Admin user not found");
      return res.status(401).json({
        success: false,
        message: "Invalid admin credentials",
      });
    }


    // Verify password
    const isValidPassword = await bcrypt.compare(password, adminUser.password);
    if (!isValidPassword) {
      console.error("❌ Invalid admin password");
      return res.status(401).json({
        success: false,
        message: "Invalid admin credentials",
      });
    }

    // Update last login
    adminUser.lastLogin = new Date();
    await adminUser.save();

    console.log("✅ Admin credentials validated successfully");

    // Generate JWT token for admin
    const adminToken = jwt.sign(
      {
        userId: adminUser._id,
        email: adminUser.email,
        name: adminUser.name,
        role: adminUser.role,
        tenantId: adminUser.tenantId,
        loginType: adminUser.loginType,
      },
      process.env.JWT_SECRET || "your-jwt-secret",
      { expiresIn: "8h" } // Shorter expiry for admin sessions
    );

    console.log("✅ Admin JWT token generated");
    console.log("🚀 Admin login successful");
  

    res.json({
      success: true,
      token: adminToken,
      user: {
        id: adminUser._id,
        email: adminUser.email,
        name: adminUser.name,
        role: adminUser.role,
        tenantId: adminUser.tenantId,
        loginType: adminUser.loginType,
      },
      message: "Admin login successful",
    });
  } catch (error) {
    console.error("❌ Error during admin login:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error during admin login",
      error: error.message,
    });
  }
};

module.exports = {
  initiateLogin,
  handleCallback,
  getProfile,
  logout,
  verifyToken,
  debugSessions,
  adminLogin,
};
