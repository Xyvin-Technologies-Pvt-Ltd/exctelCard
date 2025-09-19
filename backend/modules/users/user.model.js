const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // Entra ID / SSO fields (read-only)
    entraId: {
      type: String,
      unique: true,
      sparse: true, // Allows null values while maintaining uniqueness
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    department: {
      type: String,
      trim: true,
    },
    jobTitle: {
      type: String,
      trim: true,
    },
    tenantId: {
      type: String,
      index: true,
    },

    // User editable fields
    phone: {
      type: String,
      trim: true,
    },  
    businessPhones: {
      type: String,
      trim: true,
    },
    linkedIn: {
      type: String,
      trim: true,
    },
    profileImage: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
  

    // System fields
    role: {
      type: String,
      enum: ["user", "admin", "super_admin"],
      default: "user",
    },
    loginType: {
      type: String,
      enum: ["sso", "password"],
      default: "sso",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    // Activity tracking
    lastLoginAt: {
      type: Date,
      default: null,
    },
    lastActiveAt: {
      type: Date,
      default: Date.now,
    },
    loginCount: {
      type: Number,
      default: 0,
    },

    // Profile sharing settings
    shareId: {
      type: String,
      unique: true,
      sparse: true,
    },
    isProfilePublic: {
      type: Boolean,
      default: true,
    },
    profileViewCount: {
      type: Number,
      default: 0,
    },
    lastViewedAt: {
      type: Date,
      default: null,
    },

    // Detailed analytics for profile sharing
    analytics: {
      // View tracking
      websiteViews: {
        type: Number,
        default: 0,
      },
      profileViews: {
        type: Number,
        default: 0,
      },

      // Download tracking
      downloads: {
        type: Number,
        default: 0,
      },
      vcardDownloads: {
        type: Number,
        default: 0,
      },
      linkCopies: {
        type: Number,
        default: 0,
      },

      // Contact interaction tracking
      contactInteractions: {
        type: Number,
        default: 0,
      },
      emailClicks: {
        type: Number,
        default: 0,
      },
      phoneClicks: {
        type: Number,
        default: 0,
      },
      linkedinClicks: {
        type: Number,
        default: 0,
      },

      // Timestamps
      firstViewAt: {
        type: Date,
        default: null,
      },
      lastInteractionAt: {
        type: Date,
        default: null,
      },
    },

    // Business card customization
    cardTheme: {
      type: String,
      default: "default",
    },
    cardLayout: {
      type: String,
      default: "modern",
    },
    password: {
      type: String,
      default: null,
    },

    // Metadata
    createdBy: {
      type: String, // 'sso', 'admin', 'self-registration'
      default: "sso",
    },
    notes: {
      type: String, // Admin notes about the user
      trim: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for performance
userSchema.index({ email: 1, isActive: 1 });
userSchema.index({ department: 1, isActive: 1 });
userSchema.index({ lastLoginAt: -1 });
userSchema.index({ createdAt: -1 });

// Virtual for full activity stats
userSchema.virtual("activityStats", {
  ref: "UserActivity",
  localField: "_id",
  foreignField: "userId",
});

// Instance method to generate share ID
userSchema.methods.generateShareId = function () {
  if (!this.shareId) {
    this.shareId = require("crypto").randomBytes(8).toString("hex");
  }
  return this.shareId;
};

// Instance method to update last login
userSchema.methods.updateLastLogin = function () {
  this.lastLoginAt = new Date();
  this.lastActiveAt = new Date();
  this.loginCount += 1;
  return this.save();
};

// Static method to get admin dashboard stats
userSchema.statics.getAdminStats = async function () {
  const totalUsers = await this.countDocuments({ isActive: true });
  const newUsersThisMonth = await this.countDocuments({
    isActive: true,
    createdAt: {
      $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    },
  });
  const activeUsersThisWeek = await this.countDocuments({
    isActive: true,
    lastActiveAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
  });

  return {
    totalUsers,
    newUsersThisMonth,
    activeUsersThisWeek,
    generatedAt: new Date(),
  };
};

// Static method to search users for admin
userSchema.statics.searchForAdmin = async function (
  searchTerm = "",
  page = 1,
  limit = 20
) {
  const skip = (page - 1) * limit;

  let query = {};
  if (searchTerm) {
    query = {
      $or: [
        { name: { $regex: searchTerm, $options: "i" } },
        { email: { $regex: searchTerm, $options: "i" } },
        { department: { $regex: searchTerm, $options: "i" } },
        { jobTitle: { $regex: searchTerm, $options: "i" } },
      ],
    };
  }

  const users = await this.find(query)
    .sort({ lastLoginAt: -1, createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("activityStats")
    .lean();

  const total = await this.countDocuments(query);

  return {
    users,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

// Pre-save middleware to generate share ID if needed
userSchema.pre("save", function (next) {
  if (this.isNew && !this.shareId) {
    this.generateShareId();
  }
  next();
});

module.exports = mongoose.model("User", userSchema);
