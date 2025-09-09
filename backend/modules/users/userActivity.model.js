const mongoose = require("mongoose");

const userActivitySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Activity types
    activityType: {
      type: String,
      enum: [
        "profile_view", // Someone viewed the user's profile
        "qr_scan", // QR code was scanned
        "card_download", // Business card was downloaded
        "link_click", // Profile link was clicked
        "contact_save", // Contact was saved to phone
        "linkedin_click", // LinkedIn profile was clicked
        "phone_click", // Phone number was clicked
        "email_click", // Email was clicked
        "profile_share", // Profile was shared
        "login", // User logged in
        "profile_update", // User updated their profile,
        "website_view", // Website view
      ],
      required: true,
      index: true,
    },

    // Source information
    source: {
      type: String,
      enum: [
        "qr_code",
        "direct_link",
        "share_link",
        "email",
        "social_media",
        "search",
        "unknown",
        "sso",
        "share",
        "share_link"

      ],
      default: "unknown",
    },

    // Visitor information (who performed the action)
    visitorInfo: {
      ipAddress: String,
      userAgent: String,
      country: String,
      city: String,
      referrer: String,
      device: {
        type: String,
        enum: ["desktop", "mobile", "tablet", "unknown"],
        default: "unknown",
      },
      browser: String,
      os: String,
    },

    // Additional metadata
    metadata: {
      type: mongoose.Schema.Types.Mixed, // Flexible object for additional data
      default: {},
    },

    // Session tracking
    sessionId: String,

    // Geographic data
    location: {
      country: String,
      countryCode: String,
      region: String,
      city: String,
      latitude: Number,
      longitude: Number,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// Compound indexes for performance
userActivitySchema.index({ userId: 1, activityType: 1, createdAt: -1 });
userActivitySchema.index({ activityType: 1, createdAt: -1 });
userActivitySchema.index({ createdAt: -1 });

// Static method to get user activity summary
userActivitySchema.statics.getUserActivitySummary = async function (
  userId,
  days = 30
) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const pipeline = [
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        createdAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: "$activityType",
        count: { $sum: 1 },
        lastActivity: { $max: "$createdAt" },
      },
    },
    {
      $group: {
        _id: null,
        activities: {
          $push: {
            type: "$_id",
            count: "$count",
            lastActivity: "$lastActivity",
          },
        },
        totalActivities: { $sum: "$count" },
      },
    },
  ];

  const result = await this.aggregate(pipeline);

  if (!result.length) {
    return {
      totalActivities: 0,
      websiteView: 0,
      cardScan: 0,
      cardDownloads: 0,
      activities: [],
    };
  }

  const data = result[0];
  const activityMap = {};

  data.activities.forEach((activity) => {
    activityMap[activity.type] = activity.count;
  });

  return {
    total: data.totalActivities,
    websiteView:
      (activityMap.profile_view || 0) + (activityMap.link_click || 0),
    cardScan: activityMap.qr_scan || 0,
    cardDownloads: activityMap.card_download || 0,
    contactSaves: activityMap.contact_save || 0,
    activities: data.activities,
  };
};

// Static method to get activity analytics for admin dashboard
userActivitySchema.statics.getActivityAnalytics = async function (days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const pipeline = [
    {
      $match: {
        createdAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: {
          type: "$activityType",
          date: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
            },
          },
        },
        count: { $sum: 1 },
      },
    },
    {
      $group: {
        _id: "$_id.type",
        totalCount: { $sum: "$count" },
        dailyData: {
          $push: {
            date: "$_id.date",
            count: "$count",
          },
        },
      },
    },
  ];

  const result = await this.aggregate(pipeline);
  return result;
};

// Static method to get top active users
userActivitySchema.statics.getTopActiveUsers = async function (
  limit = 10,
  days = 30
) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const pipeline = [
    {
      $match: {
        createdAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: "$userId",
        activityCount: { $sum: 1 },
        lastActivity: { $max: "$createdAt" },
        activityTypes: { $addToSet: "$activityType" },
      },
    },
    {
      $sort: { activityCount: -1 },
    },
    {
      $limit: limit,
    },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "user",
      },
    },
    {
      $unwind: "$user",
    },
    {
      $project: {
        userId: "$_id",
        activityCount: 1,
        lastActivity: 1,
        activityTypes: 1,
        "user.name": 1,
        "user.email": 1,
        "user.department": 1,
        "user.profileImage": 1,
      },
    },
  ];

  return await this.aggregate(pipeline);
};

// Static method to track a new activity
userActivitySchema.statics.trackActivity = async function (activityData) {
  const activity = new this({
    userId: activityData.userId,
    activityType: activityData.activityType,
    source: activityData.source || "unknown",
    visitorInfo: activityData.visitorInfo || {},
    metadata: activityData.metadata || {},
    sessionId: activityData.sessionId,
    location: activityData.location || {},
  });

  await activity.save();

  // Update user's profile view count if it's a profile view
  if (activityData.activityType === "profile_view") {
    await mongoose
      .model("User")
      .findByIdAndUpdate(activityData.userId, {
        $inc: { profileViewCount: 1 },
      });
  }

  return activity;
};

module.exports = mongoose.model("UserActivity", userActivitySchema);
