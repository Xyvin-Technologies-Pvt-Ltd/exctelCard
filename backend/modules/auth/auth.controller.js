const { ConfidentialClientApplication } = require("@azure/msal-node");
const jwt = require("jsonwebtoken");
const axios = require("axios");

const {
  azureConfig,
  redirectUri,
  postLogoutRedirectUri,
  FRONTEND_URL,
} = require("../../config/azureConfig");
const User = require("../users/user.model");
const UserActivity = require("../users/userActivity.model");
const { OutlookSignature } = require("../outlook-signature/outlook-signature.model");
const bcrypt = require("bcrypt");
const qrCodeService = require("../../services/qrCodeService");
const errorHandler = require("../../services/errorHandler");

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
        `${FRONTEND_URL || "http://localhost:5173"
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
        `${FRONTEND_URL || "http://localhost:5173"}/login?error=missing_state`
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
          `${FRONTEND_URL || "http://localhost:5173"}/login?error=invalid_state`
        );
      }
    } else {
      // Remove used state
      authSessions.delete(state);
      console.log("✅ State validated and removed");
    }

    if (!code) {
      return res.redirect(
        `${FRONTEND_URL || "http://localhost:5173"
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
        shareId: azureUserInfo.shareId,
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

    // Generate QR code for user if they have a shareId
    try {
      if (user.shareId) {
        console.log("🔲 Generating QR code for user:", user.email);
        await qrCodeService.generateAndSaveQRCode(user, FRONTEND_URL, {
          size: 200,
          logoSize: 45,
        });
        console.log("✅ QR code generated successfully");
      } else {
        console.log("⚠️ User has no shareId, skipping QR code generation");
      }
    } catch (qrError) {
      console.error("❌ Error generating QR code:", qrError.message);
      // Don't fail the login if QR generation fails
    }

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
        accessToken: azureUserInfo.accessToken, // Include access token for Graph API calls
      },
      process.env.JWT_SECRET || "your-jwt-secret",
      {
        expiresIn: "1h", // Reduced expiry since we're including the access token
        algorithm: "HS256",
      }
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
      accessToken: azureUserInfo.accessToken, // Include access token for Graph API calls
    };
    req.session.token = appToken;

    // Redirect to frontend login page with token for processing
    res.redirect(
      `${FRONTEND_URL || "http://localhost:5173"}/login?token=${appToken}`
    );
  } catch (error) {
    console.error("Error handling callback:", error);
    res.redirect(
      `${FRONTEND_URL || "http://localhost:5173"
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
    console.log("👤 User profile:", req.user);

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
    const logoutUrl = `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID
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
      process.env.JWT_SECRET || "your-jwt-secret",
      { algorithms: ["HS256"] }
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
      {
        expiresIn: "8h", // Shorter expiry for admin sessions
        algorithm: "HS256",
      }
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

/**
 * Get access token for Microsoft Graph API using client credentials
 */
const getGraphAccessToken = async () => {
  try {
    console.log("🔑 Requesting Graph API access token...");

    // Validate Azure configuration
    if (
      !process.env.AZURE_CLIENT_ID ||
      !process.env.AZURE_CLIENT_SECRET ||
      !process.env.AZURE_TENANT_ID
    ) {
      throw new Error(
        "Azure configuration missing. Please check AZURE_CLIENT_ID, AZURE_CLIENT_SECRET, and AZURE_TENANT_ID environment variables."
      );
    }

    const tokenRequest = {
      scopes: ["https://graph.microsoft.com/.default"],
    };

    console.log("📋 Token request details:", {
      clientId: process.env.AZURE_CLIENT_ID ? "Present" : "Missing",
      clientSecret: process.env.AZURE_CLIENT_SECRET ? "Present" : "Missing",
      tenantId: process.env.AZURE_TENANT_ID ? "Present" : "Missing",
      scopes: tokenRequest.scopes,
    });

    const response = await msalInstance.acquireTokenByClientCredential(
      tokenRequest
    );

    console.log("✅ Graph API access token obtained successfully");
    return response.accessToken;
  } catch (error) {
    console.error("❌ Error getting Graph access token:", error);

    // Log detailed error information
    await errorHandler.logError(error, {
      action: "get_graph_access_token",
      source: "auto_sync",
      userId: null,
    });

    throw error;
  }
};

// Add this helper function before autoSyncUsers
async function fetchUserPhoto(principalId, token) {
  try {
    const photoResponse = await axios.get(
      `https://graph.microsoft.com/v1.0/users/${principalId}/photo/$value`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: 'arraybuffer'
      }
    );

    // Convert image to base64
    const base64Image = Buffer.from(photoResponse.data, 'binary').toString('base64');
    const contentType = photoResponse.headers['content-type'] || 'image/jpeg';

    return `data:${contentType};base64,${base64Image}`;
  } catch (photoError) {
    if (photoError.response?.status === 404) {
      console.log(`   No photo available for user ${principalId}`);
      return null;
    }
    console.error(`   Photo fetch error:`, photoError.message);
    return null;
  }
}
/**
 * Fetch users from Microsoft Graph API
 */
const fetchUsersFromGraph = async (accessToken, skipToken = null) => {
  try {
    // Service Principal ID from Azure Portal (Enterprise App → Overview → Object ID)
    const servicePrincipalId = process.env.SERVICE_PRINCIPAL_ID;

    const baseUrl = `https://graph.microsoft.com/v1.0/servicePrincipals/${servicePrincipalId}/appRoleAssignedTo`;
    const params = new URLSearchParams({
      $top: "999",
      $expand: "principal", // expand to get user details
    });

    if (skipToken) {
      params.append("$skiptoken", skipToken);
    }

    const url = `${baseUrl}?${params}`;
    console.log("🌐 Fetching assigned users from Graph API:", url);

    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    const assignments = response.data.value || [];

    // Extract only users (filter out groups/service principals)
    const users = assignments
      .filter((a) => a.principal["@odata.type"] === "#microsoft.graph.user")
      .map((a) => ({
        id: a.principal.id,
        displayName: a.principal.displayName,
        email: a.principal.mail || a.principal.userPrincipalName,
        jobTitle: a.principal.jobTitle,
        department: a.principal.department,
      }));

    return {
      users,
      nextLink: response.data["@odata.nextLink"] || null,
    };
  } catch (error) {
    console.error("❌ Error fetching assigned users:", {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
    });

    throw error;
  }
};

/**
 * Sync user data from Microsoft Graph to local database
 */
const syncUserFromGraph = async (graphUser, tenantId) => {
  try {
    const email = graphUser.mail || graphUser.userPrincipalName;

    if (!email) {
      console.warn("⚠️ Skipping user without email:", graphUser.id);
      return null;
    }

    // Check if user already exists
    let user = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { entraId: graphUser.id }],
    });

    const userData = {
      entraId: graphUser.id,
      email: email.toLowerCase(),
      name: graphUser.displayName || "Unknown User",
      department: graphUser.department || null,
      jobTitle: graphUser.jobTitle || null,
      tenantId: tenantId,
      businessPhones: graphUser.businessPhones || [],
      phone: graphUser.mobilePhone || null,
      isActive: graphUser.accountEnabled !== false,
      isEmailVerified: true,
      loginType: "sso",
      createdBy: "auto_sync",
    };

    if (user) {
      // Update existing user
      console.log(`🔄 Updating existing user: ${email}`);

      // Only update certain fields, preserve user customizations
      const updateFields = {
        name: userData.name,
        department: userData.department,
        jobTitle: userData.jobTitle,
        businessPhones: userData.businessPhones,
        phone: userData.phone,
        isActive: userData.isActive,
        lastActiveAt: new Date(),
      };

      // Only update if values have changed
      const hasChanges = Object.keys(updateFields).some((key) => {
        if (Array.isArray(updateFields[key])) {
          return (
            JSON.stringify(updateFields[key]) !== JSON.stringify(user[key])
          );
        }
        return updateFields[key] !== user[key];
      });

      if (hasChanges) {
        await User.findByIdAndUpdate(user._id, updateFields);
        console.log(`✅ Updated user: ${email}`);
      } else {
        console.log(`⏭️ No changes for user: ${email}`);
      }

      return { action: "updated", user: user._id, email };
    } else {
      // Create new user
      console.log(`🆕 Creating new user: ${email}`);

      const newUser = new User(userData);
      await newUser.save();

      // Generate QR code for new user
      try {
        if (newUser.shareId) {
          await qrCodeService.generateAndSaveQRCode(newUser, FRONTEND_URL, {
            size: 200,
            logoSize: 45,
          });
          console.log(`✅ QR code generated for new user: ${email}`);
        }
      } catch (qrError) {
        console.error(
          `❌ Error generating QR code for ${email}:`,
          qrError.message
        );
      }

      return { action: "created", user: newUser._id, email };
    }
  } catch (error) {
    console.error(`❌ Error syncing user ${graphUser.id}:`, error);
    return {
      action: "error",
      user: null,
      email: graphUser.mail || graphUser.userPrincipalName,
      error: error.message,
    };
  }
};

/**
 * Auto-sync ONLY users assigned to the Enterprise Application
 * Fetches users from "Users and groups" section of your Enterprise App
 */
async function autoSyncUsers(req, res) {
  let token;

  try {
    token = await getGraphAccessToken();
  } catch (tokenError) {
    console.error("❌ Failed to get access token:", tokenError.message);
    return res.status(500).json({
      success: false,
      message: "Failed to authenticate with Microsoft Graph API",
      error: tokenError.message,
    });
  }

  const userId = req.user?.userId;

  // Validate Service Principal ID is configured
  if (!process.env.SERVICE_PRINCIPAL_ID) {
    console.error("❌ SERVICE_PRINCIPAL_ID not configured");
    return res.status(500).json({
      success: false,
      message: "SERVICE_PRINCIPAL_ID environment variable is missing. Get it from Azure Portal → Enterprise Applications → Your App → Overview → Object ID",
    });
  }

  // THIS IS THE KEY: Use appRoleAssignedTo to get ONLY assigned users
  let url = `https://graph.microsoft.com/v1.0/servicePrincipals/${process.env.SERVICE_PRINCIPAL_ID}/appRoleAssignedTo?$top=999`;

  const processedAzureIds = new Set();
  const stats = {
    created: 0,
    updated: 0,
    deleted: 0,
    errors: 0,
    skipped: 0,
    totalAssignments: 0
  };

  try {
    console.log("🔄 Starting auto-sync for Enterprise App assigned users...");
    console.log(`🎯 Service Principal ID: ${process.env.SERVICE_PRINCIPAL_ID}`);

    // Pagination loop - fetch all assigned users
    while (url) {
      console.log(`📡 Fetching assignments: ${url}`);

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const assignments = response.data.value || [];
      stats.totalAssignments += assignments.length;
      console.log(`📦 Retrieved ${assignments.length} assignments`);

      for (const assignment of assignments) {
        // Only process User principals (skip Groups and ServicePrincipals)
        if (assignment.principalType !== "User") {
          console.log(`⏭️ Skipping ${assignment.principalType}: ${assignment.principalDisplayName}`);
          stats.skipped++;
          continue;
        }

        const principalId = assignment.principalId;
        console.log(`👤 Processing user: ${assignment.principalDisplayName}`);

        try {
          // Fetch full user details from Graph API
          const userResponse = await axios.get(
            `https://graph.microsoft.com/v1.0/users/${principalId}?$select=id,displayName,mail,userPrincipalName,jobTitle,department,mobilePhone,businessPhones,faxNumber,streetAddress,city,country,postalCode,state,countryOrRegion`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );

          const graphUser = userResponse.data;
          const userEmail = graphUser.mail || graphUser.userPrincipalName;

          if (!userEmail) {
            console.warn(`⚠️ User ${principalId} has no email, skipping`);
            stats.skipped++;
            continue;
          }// Fetch the actual photo
          console.log(`📸 Fetching profile photo...`);
          const profileImageData = await fetchUserPhoto(principalId, token);

          console.log(`📧 Email: ${userEmail} , Entra ID: ${principalId}`);
          processedAzureIds.add(principalId);

          // Check if user exists in database
          let existingUser = await User.findOne({
            $or: [
              { entraId: principalId },
              { email: userEmail.toLowerCase() }
            ]
          });

          if (!existingUser) {
            // Create new user
            console.log(`🆕 Creating new user: ${userEmail}`);

            const newUser = await User.create({
              entraId: principalId,
              email: userEmail.toLowerCase(),
              name: graphUser.displayName || "Unknown User",
              jobTitle: graphUser.jobTitle || "",
              department: graphUser.department || "",
              address: graphUser.streetAddress || "",
              city: graphUser.city || "",
              state: graphUser.state || "",
              country: graphUser.countryOrRegion || "",
              profileImage: profileImageData || "",
              postalCode: graphUser.postalCode || "",
              phone: graphUser.mobilePhone || null,
              businessPhones: graphUser.businessPhones || [],
              isActive: graphUser.accountEnabled !== false,
              isEmailVerified: true,
              loginType: "sso",
              createdBy: "auto_sync",
              tenantId: process.env.AZURE_TENANT_ID,
              lastActiveAt: new Date(),
            });

            // Generate QR code for new user (if applicable)
            try {
              if (newUser.shareId && typeof qrCodeService !== 'undefined') {
                await qrCodeService.generateAndSaveQRCode(
                  newUser,
                  process.env.FRONTEND_URL || "http://localhost:5173",
                  { size: 200, logoSize: 45 }
                );
                console.log(`✅ QR code generated for: ${userEmail}`);
              }
            } catch (qrError) {
              console.error(`⚠️ QR generation failed for ${userEmail}:`, qrError.message);
            }

            stats.created++;
            console.log(`✅ Created user: ${userEmail}`);

          } else {
            // Update existing user
            const updatedFields = {};

            if (existingUser.name !== graphUser.displayName) {
              updatedFields.name = graphUser.displayName;
            }
            if (existingUser.profileImage !== profileImageData) {
              updatedFields.profileImage = profileImageData;
            }
            if (existingUser.email !== userEmail.toLowerCase()) {
              updatedFields.email = userEmail.toLowerCase();
            }
            if (existingUser.jobTitle !== (graphUser.jobTitle || "")) {
              updatedFields.jobTitle = graphUser.jobTitle || "";
            }
            if (existingUser.department !== (graphUser.department || "")) {
              updatedFields.department = graphUser.department || "";
            }
            if (existingUser.phone !== graphUser.mobilePhone) {
              updatedFields.phone = graphUser.mobilePhone;
            }
            if (existingUser.address !== graphUser.streetAddress) {
              updatedFields.address = graphUser.streetAddress;
            }
            if (existingUser.city !== graphUser.city) {
              updatedFields.city = graphUser.city;
            }
            if (existingUser.state !== graphUser.state) {
              updatedFields.state = graphUser.state;
            }
            if (existingUser.country !== graphUser.countryOrRegion) {
              updatedFields.country = graphUser.countryOrRegion;
            }
            if (existingUser.postalCode !== graphUser.postalCode) {
              updatedFields.postalCode = graphUser.postalCode;
            }
            if (JSON.stringify(existingUser.businessPhones) !== JSON.stringify(graphUser.businessPhones || [])) {
              updatedFields.businessPhones = graphUser.businessPhones || [];
            }

            // Always update these fields
            updatedFields.lastActiveAt = new Date();
            updatedFields.isActive = graphUser.accountEnabled !== false;

            if (Object.keys(updatedFields).length > 1) { // > 1 because lastActiveAt is always updated
              await User.updateOne(
                { _id: existingUser._id },
                { $set: updatedFields }
              );
              stats.updated++;
              console.log(`🔄 Updated user: ${userEmail}`);
            } else {
              console.log(`⏭️ No changes for: ${userEmail}`);
            }
          }

        } catch (userError) {
          console.error(`❌ Error processing user ${principalId}:`, userError.message);
          if (userError.response) {
            console.error(`   Status: ${userError.response.status}`);
            console.error(`   Data:`, userError.response.data);
          }
          stats.errors++;
        }
      }

      // Get next page URL for pagination
      url = response.data["@odata.nextLink"] || null;
    }

    // Note: Auto-delete logic removed to allow manual user management
    // Users are no longer automatically deleted when unassigned from the Enterprise Application
    stats.deleted = 0;

    // Record sync activity
    await UserActivity.create({
      action: "auto_sync",
      userId: userId,
      activityType: "admin_action",
      metadata: {
        action: "auto_sync_users",
        summary: "Auto sync users assigned to Enterprise Application",
        stats: stats,
      },
      status: "success",
      details: JSON.stringify(stats),
    });

    console.log("✅ Auto sync complete:", stats);
    return res.json({
      success: true,
      message: "Auto sync completed successfully",
      data: {
        created: stats.created,
        updated: stats.updated,
        deleted: stats.deleted,
        errors: stats.errors,
        skipped: stats.skipped,
        totalAssignments: stats.totalAssignments,
        totalUsersProcessed: processedAzureIds.size
      },
    });

  } catch (err) {
    console.error("❌ Auto sync failed:", err.message);
    console.error("Stack trace:", err.stack);

    if (err.response) {
      console.error("API Response:", {
        status: err.response.status,
        statusText: err.response.statusText,
        data: err.response.data
      });
    }

    // Record failed sync activity
    await UserActivity.create({
      action: "auto_sync",
      userId: userId,
      activityType: "admin_action",
      metadata: {
        action: "auto_sync_users",
        summary: "Auto sync users from Enterprise Application",
        stats: stats,
      },
      status: "failed",
      details: err.message,
    });

    return res.status(500).json({
      success: false,
      message: "Auto sync failed",
      error: err.message,
      partialStats: stats
    });
  }
}


/**
 * Get sync status and statistics
 */
const getSyncStatus = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ isActive: true });
    const ssoUsers = await User.countDocuments({
      isActive: true,
      loginType: "sso",
    });
    const passwordUsers = await User.countDocuments({
      isActive: true,
      loginType: "password",
    });
    const recentSyncs = await UserActivity.find({
      activityType: "admin_action",
      "metadata.action": "auto_sync_users",
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("createdAt metadata");

    res.json({
      success: true,
      data: {
        totalUsers,
        ssoUsers,
        passwordUsers,
        recentSyncs: recentSyncs.map((sync) => ({
          timestamp: sync.createdAt,
          summary: sync.metadata?.summary,
          success: !sync.metadata?.error,
        })),
      },
    });
  } catch (error) {
    console.error("❌ Error getting sync status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get sync status",
      error: error.message,
    });
  }
};

/**
 * Helper function to extract skip token from nextLink
 */
const extractSkipToken = (nextLink) => {
  try {
    const url = new URL(nextLink);
    return url.searchParams.get("$skiptoken");
  } catch (error) {
    return null;
  }
};

/**
 * Get all users from Entra ID tenant (not just assigned ones)
 * Supports search and pagination
 */
const getAllEntraUsers = async (req, res) => {
  let token;

  try {
    token = await getGraphAccessToken();
  } catch (tokenError) {
    console.error("❌ Failed to get access token:", tokenError.message);
    return res.status(500).json({
      success: false,
      message: "Failed to authenticate with Microsoft Graph API",
      error: tokenError.message,
    });
  }

  try {
    const { search, skipToken } = req.query;
    const searchQuery = search || "";

    // Build Graph API URL
    let url = `https://graph.microsoft.com/v1.0/users?$top=999&$select=id,displayName,mail,userPrincipalName,jobTitle,department,accountEnabled`;

    // Add search filter if provided
    if (searchQuery) {
      const encodedSearch = encodeURIComponent(searchQuery);
      url += `&$filter=startswith(displayName,'${encodedSearch}') or startswith(mail,'${encodedSearch}') or startswith(userPrincipalName,'${encodedSearch}')`;
    }

    // Add pagination token if provided
    if (skipToken) {
      url += `&$skiptoken=${encodeURIComponent(skipToken)}`;
    }

    console.log("🌐 Fetching all Entra ID users:", url);

    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const graphUsers = response.data.value || [];
    const nextLink = response.data["@odata.nextLink"] || null;
    const nextSkipToken = nextLink ? extractSkipToken(nextLink) : null;

    // Get list of assigned user IDs from local database
    const assignedUsers = await User.find({
      entraId: { $exists: true, $ne: null },
      isActive: true
    }).select("entraId email");

    const assignedIds = new Set(assignedUsers.map(u => u.entraId));
    const assignedEmails = new Set(assignedUsers.map(u => u.email?.toLowerCase()));

    // Map Graph users with assignment status
    const users = graphUsers.map((user) => {
      const email = (user.mail || user.userPrincipalName || "").toLowerCase();
      const isAssigned = assignedIds.has(user.id) || assignedEmails.has(email);

      return {
        id: user.id,
        displayName: user.displayName || "Unknown",
        email: user.mail || user.userPrincipalName || "",
        jobTitle: user.jobTitle || "",
        department: user.department || "",
        accountEnabled: user.accountEnabled !== false,
        isAssigned: isAssigned,
      };
    });

    console.log(`✅ Retrieved ${users.length} users from Entra ID`);

    res.json({
      success: true,
      data: {
        users,
        nextSkipToken,
        total: users.length,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching Entra ID users:", error);

    if (error.response) {
      console.error("Graph API Error:", {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to fetch Entra ID users",
      error: error.message,
    });
  }
};

/**
 * Assign users to Enterprise Application
 * Accepts array of user IDs (principalIds) and assigns them to the app
 */
const assignUsersToApp = async (req, res) => {
  let token;

  try {
    token = await getGraphAccessToken();
  } catch (tokenError) {
    console.error("❌ Failed to get access token:", tokenError.message);
    return res.status(500).json({
      success: false,
      message: "Failed to authenticate with Microsoft Graph API",
      error: tokenError.message,
    });
  }

  try {
    const { userIds } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "userIds array is required and must not be empty",
      });
    }

    if (!process.env.SERVICE_PRINCIPAL_ID) {
      return res.status(500).json({
        success: false,
        message: "SERVICE_PRINCIPAL_ID environment variable is missing",
      });
    }

    const servicePrincipalId = process.env.SERVICE_PRINCIPAL_ID;
    const results = [];
    const stats = {
      assigned: 0,
      alreadyAssigned: 0,
      failed: 0,
      synced: 0,
    };

    console.log(`🔄 Assigning ${userIds.length} users to Enterprise Application...`);

    // Process each user
    for (const userId of userIds) {
      try {
        // First, check if user is already assigned to this service principal
        // Check user's appRoleAssignments and filter by resourceId
        const checkUrl = `https://graph.microsoft.com/v1.0/users/${userId}/appRoleAssignments?$filter=resourceId eq ${servicePrincipalId}`;

        const checkResponse = await axios.get(checkUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const existingAssignments = checkResponse.data.value || [];

        if (existingAssignments.length > 0) {
          console.log(`⏭️ User ${userId} is already assigned`);
          stats.alreadyAssigned++;
          results.push({
            userId,
            status: "already_assigned",
            message: "User is already assigned to the application",
          });

          // Still sync the user to local database
          await syncUserById(userId, token, servicePrincipalId);
          stats.synced++;
          continue;
        }

        // Get the app role ID from existing assignments or service principal
        // First, try to get an existing assignment to see what appRoleId is used
        let appRoleId = null;

        try {
          // Get existing assignments to see what appRoleId they use
          const existingAssignmentsUrl = `https://graph.microsoft.com/v1.0/servicePrincipals/${servicePrincipalId}/appRoleAssignedTo?$top=1`;
          const existingResponse = await axios.get(existingAssignmentsUrl, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });

          if (existingResponse.data.value && existingResponse.data.value.length > 0) {
            appRoleId = existingResponse.data.value[0].appRoleId;
            console.log(`📋 Found existing appRoleId from assignments: ${appRoleId}`);
          }
        } catch (err) {
          console.log(`⚠️ Could not fetch existing assignments: ${err.message}`);
        }

        // If no existing assignment found, get from service principal app roles
        if (!appRoleId) {
          const spResponse = await axios.get(
            `https://graph.microsoft.com/v1.0/servicePrincipals/${servicePrincipalId}?$select=appRoles`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );

          const appRoles = spResponse.data.appRoles || [];

          if (appRoles.length > 0) {
            // Try to find a role with value "User" or use the first available role
            const userRole = appRoles.find(role =>
              role.value === "User" ||
              role.value === "user" ||
              role.displayName === "User" ||
              role.allowedMemberTypes?.includes("User")
            );
            appRoleId = userRole ? userRole.id : appRoles[0].id;
            console.log(`📋 Using appRoleId from service principal: ${appRoleId}`);
          } else {
            // Fallback to default role ID
            appRoleId = "00000000-0000-0000-0000-000000000000";
            console.log(`📋 Using default appRoleId: ${appRoleId}`);
          }
        }

        // Assign user to Enterprise Application
        // Use the user's appRoleAssignments endpoint instead of service principal's appRoleAssignedTo
        const assignUrl = `https://graph.microsoft.com/v1.0/users/${userId}/appRoleAssignments`;
        const assignPayload = {
          principalId: userId,
          resourceId: servicePrincipalId,
          appRoleId: appRoleId,
        };

        console.log(`📤 Assignment URL: ${assignUrl}`);
        console.log(`📤 Assignment payload:`, JSON.stringify(assignPayload, null, 2));

        await axios.post(assignUrl, assignPayload, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        console.log(`✅ Assigned user ${userId} to Enterprise Application`);
        stats.assigned++;
        results.push({
          userId,
          status: "assigned",
          message: "User successfully assigned to the application",
        });

        // Sync user to local database
        const syncResult = await syncUserById(userId, token, servicePrincipalId);
        stats.synced++;

        // Create signature if user was newly created
        if (syncResult && syncResult.action === "created") {
          try {
            const user = await User.findOne({ entraId: userId });
            if (user) {
              await createSignatureForUser(user);
              console.log(`✅ Signature created for newly assigned user ${userId}`);
            }
          } catch (sigError) {
            console.error(`⚠️ Failed to create signature for user ${userId}:`, sigError.message);
          }
        }

      } catch (userError) {
        // Log detailed error information
        console.error(`❌ Error assigning user ${userId}:`, {
          message: userError.message,
          status: userError.response?.status,
          statusText: userError.response?.statusText,
          errorData: userError.response?.data,
        });

        const errorMessage = userError.response?.data?.error?.message || userError.message;

        // Handle "already assigned" error gracefully
        if (userError.response?.status === 400) {
          const errorLower = errorMessage.toLowerCase();
          if (errorLower.includes("already exists") ||
            errorLower.includes("already assigned") ||
            errorLower.includes("duplicate")) {
            stats.alreadyAssigned++;
            results.push({
              userId,
              status: "already_assigned",
              message: "User is already assigned to the application",
            });

            // Still try to sync
            try {
              const syncResult = await syncUserById(userId, token, servicePrincipalId);
              stats.synced++;

              // Create signature if user was newly created
              if (syncResult && syncResult.action === "created") {
                try {
                  const user = await User.findOne({ entraId: userId });
                  if (user) {
                    await createSignatureForUser(user);
                    console.log(`✅ Signature created for already-assigned user ${userId}`);
                  }
                } catch (sigError) {
                  console.error(`⚠️ Failed to create signature for user ${userId}:`, sigError.message);
                }
              }
            } catch (syncError) {
              console.error(`⚠️ Failed to sync already-assigned user ${userId}:`, syncError.message);
            }
            continue;
          }
        }

        // For other errors, mark as failed
        stats.failed++;
        results.push({
          userId,
          status: "failed",
          message: errorMessage,
        });
      }
    }

    // Record activity
    const userId = req.user?.userId;
    await UserActivity.create({
      action: "assign_users",
      userId: userId,
      activityType: "admin_action",
      metadata: {
        action: "assign_users_to_app",
        summary: `Assigned ${stats.assigned} users, ${stats.alreadyAssigned} already assigned, ${stats.failed} failed`,
        stats: stats,
      },
      status: stats.failed === 0 ? "success" : "partial_success",
      details: JSON.stringify(results),
    });

    console.log(`✅ Assignment complete:`, stats);

    res.json({
      success: true,
      message: "User assignment completed",
      data: {
        results,
        stats,
      },
    });
  } catch (error) {
    console.error("❌ Error assigning users:", error);
    res.status(500).json({
      success: false,
      message: "Failed to assign users",
      error: error.message,
    });
  }
};

/**
 * Helper function to create signature configuration for a user
 */
const createSignatureForUser = async (user) => {
  try {
    // Check if signature already exists
    const existingSignature = await OutlookSignature.findOne({
      $or: [
        { user_id: user.email },
        { user_id: user._id.toString() }
      ]
    });

    if (existingSignature) {
      console.log(`⏭️ Signature already exists for user ${user.email}`);
      return existingSignature;
    }

    // Default HTML template (same as in outlook-signature.controller.js)
    const DEFAULT_HTML_TEMPLATE = `<!--[if mso]>
<style type="text/css">
@font-face{font-family:"AktivGrotesk";src:url("https://cdn-ileaolp.nitrocdn.com/XyERqqlzUUUQQwlWmuaJLVHDbQgsqGcu/assets/static/source/rev-0cb01a5/betasite.exctel.com/wp-content/uploads/2025/03/AktivGrotesk-Regular.otf") format("opentype");font-weight:400;font-style:normal;font-display:swap}
body, table, td { font-family: "AktivGrotesk", Arial, sans-serif !important; }
</style>
<![endif]-->
<table cellpadding="0" cellspacing="0" border="0" style="font-family:'AktivGrotesk',Arial,sans-serif;font-size:15px;line-height:1.4;color:#333;width:600px;margin:0;padding:0">
<tr>
<td valign="top" style="padding-right:20px;width:180px;font-family:'AktivGrotesk',Arial,sans-serif">
<div style="font-weight:bold;color:#000;font-size:17px;margin-bottom:2px;font-family:'AktivGrotesk',Arial,sans-serif;line-height:1.2">%%FirstName%% %%LastName%%</div>
<div style="color:#000;font-size:16px;margin-bottom:15px;font-family:'AktivGrotesk',Arial,sans-serif;line-height:1.2">%%Title%%</div>
<div style="margin-bottom:15px"><img src="https://cdn-ileaolp.nitrocdn.com/XyERqqlzUUUQQwlWmuaJLVHDbQgsqGcu/assets/images/optimized/rev-6c1cac3/betasite.exctel.com/wp-content/uploads/2025/04/Exctel-Logo-FA.png" alt="Exctel" width="160" style="display:block;border:none;outline:none"></div>
</td>
<td valign="top" style="padding-left:20px;font-size:14px;color:#333;font-family:'AktivGrotesk',Arial,sans-serif">
<table cellpadding="3" cellspacing="0" border="0" style="font-size:14px;font-family:'AktivGrotesk',Arial,sans-serif">
<tr><td style="width:20px;padding-right:8px;font-family:'AktivGrotesk',Arial,sans-serif"><img src="https://img.icons8.com/?size=100&id=blLagk1rxZGp&format=png&color=000000" alt="Email" width="14" height="14" style="display:block;border:none;outline:none"></td><td style="font-family:'AktivGrotesk',Arial,sans-serif;color:#333">%%Email%%</td></tr>
<tr><td style="padding-right:8px;font-family:'AktivGrotesk',Arial,sans-serif"><img src="https://img.icons8.com/?size=100&id=11471&format=png&color=000000" alt="Mobile" width="14" height="14" style="display:block;border:none;outline:none"></td><td style="font-family:'AktivGrotesk',Arial,sans-serif;color:#333">%%MobileNumber%%</td></tr>
%%IF_FAX%%<tr><td style="padding-right:8px;font-family:'AktivGrotesk',Arial,sans-serif"><img src="https://img.icons8.com/?size=100&id=11471&format=png&color=000000" alt="Fax" width="14" height="14" style="display:block;border:none;outline:none"></td><td style="font-family:'AktivGrotesk',Arial,sans-serif;color:#333">%%FaxNumber%%</td></tr>%%ENDIF_FAX%%
<tr><td style="padding-right:8px;font-family:'AktivGrotesk',Arial,sans-serif"><img src="https://img.icons8.com/?size=200&id=pjumbCENHfje&format=png&color=000000" alt="Landline" width="14" height="14" style="display:block;border:none;outline:none"></td><td style="font-family:'AktivGrotesk',Arial,sans-serif;color:#333">%%PhoneNumber%%</td></tr>
<tr><td style="padding-right:8px;vertical-align:top;font-family:'AktivGrotesk',Arial,sans-serif"><img src="https://img.icons8.com/ios-filled/50/000000/marker.png" alt="Address" width="12" height="14" style="display:block;border:none;outline:none"></td><td style="font-family:'AktivGrotesk',Arial,sans-serif;color:#333">%%Street%%</td></tr>
</table>
</td>
</tr></table>
<table width="600" cellpadding="0" cellspacing="0" border="0"><tr><td style="border-top:2px solid #ff8331;line-height:0;font-size:0;margin:2px;padding:0">&nbsp;</td></tr></table>
<table cellpadding="0" cellspacing="0" border="0" style="font-family:'AktivGrotesk',Arial,sans-serif;font-size:14px;width:500px;margin-top:10px">
<tr><td style="width:180px;padding-right:20px;font-family:'AktivGrotesk',Arial,sans-serif"><span style="color:#000;font-weight:bold;font-family:'AktivGrotesk',Arial,sans-serif">w&#8203;w&#8203;w&#8203;.&#8203;exctel&#8203;.&#8203;com</span></td>
<td style="padding-left:20px;font-family:'AktivGrotesk',Arial,sans-serif">
<table cellpadding="0" cellspacing="0" border="0"><tr>
<td style="padding-right:8px;font-family:'AktivGrotesk',Arial,sans-serif"><img src="https://img.icons8.com/ios-filled/50/000000/linkedin.png" width="20" height="20" alt="LinkedIn" style="display:block;border:none;outline:none"></td>
<td style="padding-right:8px;font-family:'AktivGrotesk',Arial,sans-serif"><img src="https://www.freeiconspng.com/uploads/new-x-twitter-logo-png-photo-1.png" width="20" height="20" alt="X" style="display:block;border:none;outline:none"></td>
<td style="padding-right:8px;font-family:'AktivGrotesk',Arial,sans-serif"><img src="https://img.icons8.com/ios-filled/50/000000/facebook-new.png" width="20" height="20" alt="Facebook" style="display:block;border:none;outline:none"></td>
<td style="padding-right:8px;font-family:'AktivGrotesk',Arial,sans-serif"><img src="https://img.icons8.com/ios-filled/50/000000/instagram-new.png" width="20" height="20" alt="Instagram" style="display:block;border:none;outline:none"></td>
</tr></table>
</td></tr></table>
<table cellpadding="0" cellspacing="0" border="0" style="font-family:'AktivGrotesk',Arial,sans-serif;font-size:9px;line-height:1.4;color:#333;width:600px;margin-top:10px">
<tr><td style="padding-top:10px;font-style:italic;color:#555;text-align:justify;font-family:'AktivGrotesk',Arial,sans-serif">
    This email and any attachments are confidential and intended solely for the use of the individual or entity to whom they are addressed. If you are not the intended recipient, please delete this message, notify the sender immediately, and note that any review, use, disclosure, or distribution of its contents is strictly prohibited. We accept no liability for any errors, delays, or security issues that may arise during the transmission of this email.
</td></tr></table>`;

    // Create signature configuration
    const signatureConfig = new OutlookSignature({
      signature_name: `${user.name || user.email}'s Signature`,
      user_id: user.email, // Use email as user_id
      html_template: DEFAULT_HTML_TEMPLATE,
      placeholders: {},
      user_profile: {},
      description: "Auto-generated during user assignment",
      is_active: true,
      created_by: "auto_sync",
      updated_by: "auto_sync",
    });

    await signatureConfig.save();
    return signatureConfig;
  } catch (error) {
    console.error(`❌ Error creating signature for user ${user.email}:`, error.message);
    throw error;
  }
};

/**
 * Helper function to sync a single user by ID to local database
 */
const syncUserById = async (principalId, token, servicePrincipalId) => {
  try {
    // Fetch full user details from Graph API
    const userResponse = await axios.get(
      `https://graph.microsoft.com/v1.0/users/${principalId}?$select=id,displayName,mail,userPrincipalName,jobTitle,department,mobilePhone,businessPhones,faxNumber,streetAddress,city,country,postalCode,state,countryOrRegion,accountEnabled`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const graphUser = userResponse.data;
    const userEmail = graphUser.mail || graphUser.userPrincipalName;

    if (!userEmail) {
      console.warn(`⚠️ User ${principalId} has no email, skipping sync`);
      return null;
    }

    // Fetch profile photo
    const profileImageData = await fetchUserPhoto(principalId, token);

    // Check if user exists in database
    let existingUser = await User.findOne({
      $or: [
        { entraId: principalId },
        { email: userEmail.toLowerCase() }
      ]
    });

    if (!existingUser) {
      // Create new user
      console.log(`🆕 Creating new user: ${userEmail}`);

      const newUser = await User.create({
        entraId: principalId,
        email: userEmail.toLowerCase(),
        name: graphUser.displayName || "Unknown User",
        jobTitle: graphUser.jobTitle || "",
        department: graphUser.department || "",
        address: graphUser.streetAddress || "",
        city: graphUser.city || "",
        state: graphUser.state || "",
        country: graphUser.countryOrRegion || "",
        profileImage: profileImageData || "",
        postalCode: graphUser.postalCode || "",
        phone: graphUser.mobilePhone || null,
        businessPhones: graphUser.businessPhones || [],
        isActive: graphUser.accountEnabled !== false,
        isEmailVerified: true,
        loginType: "sso",
        createdBy: "manual_add",
        tenantId: process.env.AZURE_TENANT_ID,
        lastActiveAt: new Date(),
      });

      // Generate QR code for new user
      try {
        if (newUser.shareId && typeof qrCodeService !== 'undefined') {
          await qrCodeService.generateAndSaveQRCode(
            newUser,
            process.env.FRONTEND_URL || "http://localhost:5173",
            { size: 200, logoSize: 45 }
          );
          console.log(`✅ QR code generated for: ${userEmail}`);
        }
      } catch (qrError) {
        console.error(`⚠️ QR generation failed for ${userEmail}:`, qrError.message);
      }

      // Create signature configuration for new user
      try {
        await createSignatureForUser(newUser);
        console.log(`✅ Signature configuration created for: ${userEmail}`);
      } catch (sigError) {
        console.error(`⚠️ Signature creation failed for ${userEmail}:`, sigError.message);
        // Don't fail the whole operation if signature creation fails
      }

      return { action: "created", user: newUser._id, email: userEmail };
    } else {
      // Update existing user
      const updatedFields = {};

      if (existingUser.name !== graphUser.displayName) {
        updatedFields.name = graphUser.displayName;
      }
      if (existingUser.profileImage !== profileImageData && profileImageData) {
        updatedFields.profileImage = profileImageData;
      }
      if (existingUser.email !== userEmail.toLowerCase()) {
        updatedFields.email = userEmail.toLowerCase();
      }
      if (existingUser.jobTitle !== (graphUser.jobTitle || "")) {
        updatedFields.jobTitle = graphUser.jobTitle || "";
      }
      if (existingUser.department !== (graphUser.department || "")) {
        updatedFields.department = graphUser.department || "";
      }
      if (existingUser.phone !== graphUser.mobilePhone) {
        updatedFields.phone = graphUser.mobilePhone;
      }
      if (existingUser.address !== graphUser.streetAddress) {
        updatedFields.address = graphUser.streetAddress;
      }
      if (existingUser.city !== graphUser.city) {
        updatedFields.city = graphUser.city;
      }
      if (existingUser.state !== graphUser.state) {
        updatedFields.state = graphUser.state;
      }
      if (existingUser.country !== graphUser.countryOrRegion) {
        updatedFields.country = graphUser.countryOrRegion;
      }
      if (existingUser.postalCode !== graphUser.postalCode) {
        updatedFields.postalCode = graphUser.postalCode;
      }
      if (JSON.stringify(existingUser.businessPhones) !== JSON.stringify(graphUser.businessPhones || [])) {
        updatedFields.businessPhones = graphUser.businessPhones || [];
      }

      updatedFields.lastActiveAt = new Date();
      updatedFields.isActive = graphUser.accountEnabled !== false;

      if (Object.keys(updatedFields).length > 1) {
        await User.updateOne(
          { _id: existingUser._id },
          { $set: updatedFields }
        );
        console.log(`🔄 Updated user: ${userEmail}`);
      }

      return { action: "updated", user: existingUser._id, email: userEmail };
    }
  } catch (error) {
    console.error(`❌ Error syncing user ${principalId}:`, error.message);
    throw error;
  }
};

/**
 * Remove users from Enterprise Application and local database
 * Accepts array of user IDs (principalIds) and removes them from both
 */
const removeUsersFromApp = async (req, res) => {
  let token;

  try {
    token = await getGraphAccessToken();
  } catch (tokenError) {
    console.error("❌ Failed to get access token:", tokenError.message);
    return res.status(500).json({
      success: false,
      message: "Failed to authenticate with Microsoft Graph API",
      error: tokenError.message,
    });
  }

  try {
    const { userIds } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "userIds array is required and must not be empty",
      });
    }

    if (!process.env.SERVICE_PRINCIPAL_ID) {
      return res.status(500).json({
        success: false,
        message: "SERVICE_PRINCIPAL_ID environment variable is missing",
      });
    }

    const servicePrincipalId = process.env.SERVICE_PRINCIPAL_ID;
    const results = [];
    const stats = {
      unassigned: 0,
      deleted: 0,
      signaturesDeleted: 0,
      failed: 0,
      notFound: 0,
    };

    console.log(`🔄 Removing ${userIds.length} users from Enterprise Application...`);

    // Process each user
    for (const userId of userIds) {
      try {
        // First, find the app role assignment ID for this user
        const checkUrl = `https://graph.microsoft.com/v1.0/users/${userId}/appRoleAssignments?$filter=resourceId eq ${servicePrincipalId}`;

        const checkResponse = await axios.get(checkUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const existingAssignments = checkResponse.data.value || [];

        if (existingAssignments.length === 0) {
          console.log(`⏭️ User ${userId} is not assigned to the application`);
          stats.notFound++;
          results.push({
            userId,
            status: "not_assigned",
            message: "User is not assigned to the application",
          });
        } else {
          // Delete each assignment (user might have multiple roles)
          for (const assignment of existingAssignments) {
            try {
              const deleteUrl = `https://graph.microsoft.com/v1.0/users/${userId}/appRoleAssignments/${assignment.id}`;

              await axios.delete(deleteUrl, {
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
              });

              console.log(`✅ Removed app role assignment ${assignment.id} for user ${userId}`);
            } catch (deleteError) {
              console.error(`❌ Error deleting assignment ${assignment.id}:`, deleteError.message);
              // Continue with other assignments even if one fails
            }
          }

          stats.unassigned++;
          results.push({
            userId,
            status: "unassigned",
            message: "User successfully unassigned from the application",
          });
        }

        // Remove user from local database and delete signature configs
        try {
          const user = await User.findOne({
            entraId: userId
          });

          if (user) {
            // Delete all signature configurations for this user
            // Signature configs can have user_id as either email or _id
            const signatureDeleteResult = await OutlookSignature.deleteMany({
              $or: [
                { user_id: user.email },
                { user_id: user._id.toString() }
              ]
            });

            if (signatureDeleteResult.deletedCount > 0) {
              console.log(`🗑️ Deleted ${signatureDeleteResult.deletedCount} signature config(s) for user ${user.email}`);
              stats.signaturesDeleted += signatureDeleteResult.deletedCount;
            }

            // Hard delete (remove from database)
            await User.findByIdAndDelete(user._id);

            console.log(`🗑️ Deleted user ${user.email} (${user._id}) from local database`);
            stats.deleted++;
          } else {
            console.log(`⚠️ User with entraId ${userId} not found in local database`);

            // Even if user not found, try to delete signatures by entraId (in case user_id was stored as entraId)
            try {
              const signatureDeleteResult = await OutlookSignature.deleteMany({
                user_id: userId
              });
              if (signatureDeleteResult.deletedCount > 0) {
                console.log(`🗑️ Deleted ${signatureDeleteResult.deletedCount} signature config(s) for entraId ${userId}`);
                stats.signaturesDeleted += signatureDeleteResult.deletedCount;
              }
            } catch (sigError) {
              console.error(`⚠️ Error deleting signatures for entraId ${userId}:`, sigError.message);
            }
          }
        } catch (dbError) {
          console.error(`❌ Error deleting user from database:`, dbError.message);
          // Don't fail the whole operation if DB delete fails
        }

      } catch (userError) {
        console.error(`❌ Error removing user ${userId}:`, {
          message: userError.message,
          status: userError.response?.status,
          statusText: userError.response?.statusText,
          errorData: userError.response?.data,
        });

        stats.failed++;
        results.push({
          userId,
          status: "failed",
          message: userError.response?.data?.error?.message || userError.message,
        });
      }
    }

    // Record activity
    const adminUserId = req.user?.userId;
    await UserActivity.create({
      action: "remove_users",
      userId: adminUserId,
      activityType: "admin_action",
      metadata: {
        action: "remove_users_from_app",
        summary: `Removed ${stats.unassigned} users, deleted ${stats.deleted} from database, ${stats.failed} failed`,
        stats: stats,
      },
      status: stats.failed === 0 ? "success" : "partial_success",
      details: JSON.stringify(results),
    });

    console.log(`✅ Removal complete:`, stats);

    res.json({
      success: true,
      message: "User removal completed",
      data: {
        results,
        stats,
      },
    });
  } catch (error) {
    console.error("❌ Error removing users:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove users",
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

  adminLogin,
  autoSyncUsers,
  getSyncStatus,
  getGraphAccessToken,
  fetchUsersFromGraph,
  syncUserFromGraph,
  getAllEntraUsers,
  assignUsersToApp,
  removeUsersFromApp,
};
