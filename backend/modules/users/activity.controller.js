const UserActivity = require("./userActivity.model");
const User = require("./user.model");

/**
 * Get all activities with optional filters
 */
exports.getActivities = async (req, res) => {
  try {
    const { type, timeRange } = req.query;
    const userEmail = req.user.email;

    // Find user to get their ObjectId
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Build query
    const query = { userId: user._id };

    // Map frontend activity types to backend activity types
    if (type && type !== "all") {
      const typeMapping = {
        scan: "qr_scan",
        download: "card_download",
        "website view": "profile_view",
      };
      query.activityType = typeMapping[type] || type;
    }

    // Add time range filter
    if (timeRange && timeRange !== "all") {
      const now = new Date();
      let startDate;

      switch (timeRange) {
        case "today":
          startDate = new Date(now.setHours(0, 0, 0, 0));
          break;
        case "week":
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case "month":
          startDate = new Date(now.setMonth(now.getMonth() - 1));
          break;
        default:
          startDate = null;
      }

      if (startDate) {
        query.createdAt = { $gte: startDate };
      }
    }

    // Get activities
    const activities = await UserActivity.find(query)
      .sort({ createdAt: -1 })
      .lean();

    // Map backend activity types to frontend format
    const mappedActivities = activities.map((activity) => ({
      _id: activity._id,
      type:
        activity.activityType === "qr_scan"
          ? "scan"
          : activity.activityType === "card_download"
          ? "download"
          : activity.activityType === "profile_view"
          ? "website view"
          : activity.activityType,
      timestamp: activity.createdAt,
      metadata: activity.metadata,
      source: activity.source,
      visitorInfo: activity.visitorInfo,
    }));

    res.json({ activities: mappedActivities });
  } catch (error) {
    console.error("Error getting activities:", error);
    res.status(500).json({ message: "Error getting activities" });
  }
};

/**
 * Get activity statistics
 */
exports.getActivityStats = async (req, res) => {
  try {
    const userEmail = req.user.email;

    // Find user to get their ObjectId
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get activity summary using the static method
    const summary = await UserActivity.getUserActivitySummary(user._id);

    res.json({
      stats: {
        total: summary.total,
        scans: summary.cardScan,
        downloads: summary.cardDownloads,
        websiteViews: summary.websiteView,
      },
    });
  } catch (error) {
    console.error("Error getting activity stats:", error);
    res.status(500).json({ message: "Error getting activity statistics" });
  }
};

/**
 * Get user-specific activity (for admin)
 */
exports.getUserActivity = async (req, res) => {
  try {
    const { userId } = req.params;

    // userId here is the MongoDB ObjectId
    const summary = await UserActivity.getUserActivitySummary(userId);

    res.json(summary);
  } catch (error) {
    console.error("Error getting user activity:", error);
    res.status(500).json({ message: "Error getting user activity" });
  }
};
