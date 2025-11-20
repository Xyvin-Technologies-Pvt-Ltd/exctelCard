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
        `${
          FRONTEND_URL || "http://localhost:5173"
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
        `${
          FRONTEND_URL || "http://localhost:5173"
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
      `${
        FRONTEND_URL || "http://localhost:5173"
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

    // 🗑️ Delete users who are no longer assigned to the app
    console.log("🧹 Cleaning up unassigned users...");
    const deleteResult = await User.deleteMany({
      entraId: { $exists: true, $nin: Array.from(processedAzureIds) },
      loginType: "sso",
    });

    stats.deleted = deleteResult.deletedCount;
    console.log(`🗑️ Deleted ${stats.deleted} unassigned users`);

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
};
