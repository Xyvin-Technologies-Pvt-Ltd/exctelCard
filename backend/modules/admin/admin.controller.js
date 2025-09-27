const User = require("../users/user.model");
const UserActivity = require("../users/userActivity.model");
const SSOConfig = require("./ssoConfig.model");
const QRCodeModel = require("../qrcode/qrcode.model");

/**
 * Get dashboard overview stats
 */
const getDashboardStats = async (req, res) => {
  try {
    console.log("📊 Getting admin dashboard stats...");

    // Get user statistics
    const userStats = await User.getAdminStats();

    // Get activity analytics for last 30 days
    const activityAnalytics = await UserActivity.getActivityAnalytics(30);

    // Get top active users
    const topActiveUsers = await UserActivity.getTopActiveUsers(5, 30);

    // Get SSO configuration status
    const ssoConfig = await SSOConfig.getActiveConfig();

    const stats = {
      users: userStats,
      activity: {
        totalActivities: activityAnalytics.reduce(
          (sum, item) => sum + item.totalCount,
          0
        ),
        analytics: activityAnalytics,
      },
      topActiveUsers,
      sso: {
        isConfigured: !!ssoConfig,
        provider: ssoConfig?.provider || null,
        lastLogin: ssoConfig?.lastLoginAt || null,
      },
    };

    console.log("✅ Dashboard stats retrieved successfully");
    res.json({
      success: true,
      data: stats,
      message: "Dashboard stats retrieved successfully",
    });
  } catch (error) {
    console.error("❌ Error getting dashboard stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get dashboard stats",
      error: error.message,
    });
  }
};

/**
 * Get all users with pagination and search
 */
const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(query)
      .select("-password")
      .sort({ lastLogin: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate({
        path: "qrCodes",
        model: "QRCode",
        match: { isActive: true },
        options: { sort: { createdAt: -1 }, limit: 1 },
      });

    const count = await User.countDocuments(query);

    res.json({
      users,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalUsers: count,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Error fetching users" });
  }
};

/**
 * Get user activity
 */
const getUserActivity = async (req, res) => {
  try {
    const { userId } = req.params;

    const activity = await User.findById(userId);
    const UserActivity = activity.analytics;

    // Aggregate activity counts
    const activityCounts = {
      websiteView: UserActivity.websiteViews,
      vcardDownloads: UserActivity.vcardDownloads,
      cardDownloads: UserActivity.downloads,
      profileView: UserActivity.profileViews,
      linkClick: UserActivity.linkCopies,
      total:
        UserActivity.websiteViews +
        UserActivity.vcardDownloads +
        UserActivity.profileViews +
        UserActivity.linkCopies +
        UserActivity.downloads,
    };
    console.log(activityCounts);
    res.status(200).json(activityCounts);
  } catch (error) {
    console.error("Error fetching user activity:", error);
    res.status(500).json({ message: "Error fetching user activity" });
  }
};

/**
 * Search users
 */
const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    const query = {
      $or: [
        { name: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
      ],
    };

    const users = await User.find(query).select("-password").limit(10);

    res.json({ users });
  } catch (error) {
    console.error("Error searching users:", error);
    res.status(500).json({ message: "Error searching users" });
  }
};

/**
 * Update user status (activate/deactivate)
 */
const updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive, notes } = req.body;

    console.log(`🔄 Updating user ${userId} status to ${isActive}...`);

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.isActive = isActive;
    if (notes) {
      user.notes = notes;
    }

    await user.save();

    console.log("✅ User status updated successfully");
    res.json({
      success: true,
      data: user,
      message: "User status updated successfully",
    });
  } catch (error) {
    console.error("❌ Error updating user status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update user status",
      error: error.message,
    });
  }
};

/**
 * Get all SSO configurations
 */
const getSSOConfigurations = async (req, res) => {
  try {
    console.log("🔧 Getting SSO configurations...");

    const configurations = await SSOConfig.getAllForAdmin();

    console.log(`✅ Retrieved ${configurations.length} SSO configurations`);
    res.json({
      success: true,
      data: configurations,
      message: "SSO configurations retrieved successfully",
    });
  } catch (error) {
    console.error("❌ Error getting SSO configurations:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get SSO configurations",
      error: error.message,
    });
  }
};

/**
 * Create or update SSO configuration
 */
const saveSSOConfiguration = async (req, res) => {
  try {
    const {
      provider,
      providerName,
      clientId,
      clientSecret,
      tenantId,
      redirectUri,
      postLogoutRedirectUri,
      autoProvisioning,
      defaultRole,
      isActive,
      isPrimary,
    } = req.body;

    console.log(`🔧 Saving SSO configuration for ${provider}...`);

    // Validate required fields
    if (!provider || !clientId || !clientSecret || !redirectUri) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: provider, clientId, clientSecret, redirectUri",
      });
    }

    let config = await SSOConfig.findOne({ provider });

    if (config) {
      // Update existing configuration
      config.providerName = providerName || config.providerName;
      config.clientId = clientId;
      config.clientSecret = clientSecret;
      config.tenantId = tenantId;
      config.redirectUri = redirectUri;
      config.postLogoutRedirectUri = postLogoutRedirectUri;
      config.autoProvisioning = autoProvisioning;
      config.defaultRole = defaultRole;
      config.isActive = isActive;
      config.isPrimary = isPrimary;
      config.lastModifiedBy = req.user.userId;
    } else {
      // Create new configuration
      config = new SSOConfig({
        provider,
        providerName: providerName || provider,
        clientId,
        clientSecret,
        tenantId,
        redirectUri,
        postLogoutRedirectUri,
        autoProvisioning: autoProvisioning !== false,
        defaultRole: defaultRole || "user",
        isActive: isActive !== false,
        isPrimary: isPrimary === true,
        createdBy: req.user.userId,
        lastModifiedBy: req.user.userId,
      });
    }

    await config.save();

    console.log("✅ SSO configuration saved successfully");
    res.json({
      success: true,
      data: config,
      message: "SSO configuration saved successfully",
    });
  } catch (error) {
    console.error("❌ Error saving SSO configuration:", error);
    res.status(500).json({
      success: false,
      message: "Failed to save SSO configuration",
      error: error.message,
    });
  }
};

/**
 * Test SSO configuration
 */
const testSSOConfiguration = async (req, res) => {
  try {
    const { configId } = req.params;

    console.log(`🧪 Testing SSO configuration ${configId}...`);

    const config = await SSOConfig.findById(configId);
    if (!config) {
      return res.status(404).json({
        success: false,
        message: "SSO configuration not found",
      });
    }

    const testResult = await config.testConnection(req.user.userId);

    console.log("✅ SSO configuration test completed");
    res.json({
      success: true,
      data: testResult,
      message: "SSO configuration test completed",
    });
  } catch (error) {
    console.error("❌ Error testing SSO configuration:", error);
    res.status(500).json({
      success: false,
      message: "Failed to test SSO configuration",
      error: error.message,
    });
  }
};

/**
 * Get system analytics
 */
const getSystemAnalytics = async (req, res) => {
  try {
    const { days = 30 } = req.query;

    console.log(`📊 Getting system analytics for ${days} days...`);

    const analytics = await UserActivity.getActivityAnalytics(parseInt(days));
    const topActiveUsers = await UserActivity.getTopActiveUsers(
      10,
      parseInt(days)
    );
    const userStats = await User.getAdminStats();

    console.log("✅ System analytics retrieved successfully");
    res.json({
      success: true,
      data: {
        analytics,
        topActiveUsers,
        userStats,
        period: parseInt(days),
      },
      message: "System analytics retrieved successfully",
    });
  } catch (error) {
    console.error("❌ Error getting system analytics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get system analytics",
      error: error.message,
    });
  }
};

module.exports = {
  getDashboardStats,
  getUsers,
  getUserActivity,
  searchUsers,
  updateUserStatus,
  getSSOConfigurations,
  saveSSOConfiguration,
  testSSOConfiguration,
  getSystemAnalytics,
};
