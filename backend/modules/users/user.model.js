const mongoose = require("mongoose");
const crypto = require("crypto");
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
      type: [String],
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
    city: {
      type: String,
      trim: true,
    },
    state: {
      type: String,
      trim: true,
    },
    country: {
      type: String,
      trim: true,
    },
    postalCode: {
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

    // QR Code settings
    qrCode: {
      dataUrl: {
        type: String, // Base64 encoded QR code image
        default: null,
      },
      size: {
        type: Number,
        default: 200,
      },
      logoSize: {
        type: Number,
        default: 45,
      },
      generatedAt: {
        type: Date,
        default: null,
      },
      version: {
        type: String,
        default: null, // Track QR code version for cache busting
      },
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
    
      // Download tracking
      bizcardDownloads: {
        type: Number,
        default: 0,
      },
      vcardDownloads: {
        type: Number,
        default: 0,
      },
      qrcodeDownloads: {
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
userSchema.index({ lastActiveAt: -1 }); // For admin sorting
userSchema.index({ createdAt: -1 });
userSchema.index({ name: 1 }); // For search
userSchema.index({ shareId: 1 }); // For QR code lookups
userSchema.index({ isActive: 1, lastActiveAt: -1 }); // Compound index for admin queries





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

userSchema.methods.generateShareId = function () {
  if (this.shareId) {
    return;
  }
  this.shareId = crypto.randomBytes(8).toString("hex");
};

// Pre-save middleware to generate share ID if needed
userSchema.pre("save", function (next) {
  if (this.isNew && !this.shareId) {
    this.generateShareId();
  }
  next();
});

module.exports = mongoose.model("User", userSchema);
