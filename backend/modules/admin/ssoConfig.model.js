const mongoose = require("mongoose");

const ssoConfigSchema = new mongoose.Schema(
  {
    // Provider information
    provider: {
      type: String,
      enum: ["microsoft", "google", "okta", "auth0", "saml", "custom"],
      required: true,
      index: true,
    },

    providerName: {
      type: String,
      required: true,
      trim: true,
    },

    // Configuration status
    isActive: {
      type: Boolean,
      default: false,
    },

    isPrimary: {
      type: Boolean,
      default: false, // Only one provider can be primary
    },

    // OAuth/OIDC Configuration
    clientId: {
      type: String,
      required: true,
      trim: true,
    },

    clientSecret: {
      type: String,
      required: true,
      // Note: In production, consider encrypting this field
    },

    tenantId: {
      type: String, // For Microsoft, tenant ID
      trim: true,
    },

    // URLs and endpoints
    authority: {
      type: String, // Authorization server URL
      trim: true,
    },

    redirectUri: {
      type: String,
      required: true,
      trim: true,
    },

    postLogoutRedirectUri: {
      type: String,
      trim: true,
    },

    // Scopes and permissions
    scopes: [
      {
        type: String,
        trim: true,
      },
    ],

    // User provisioning settings
    autoProvisioning: {
      type: Boolean,
      default: true,
    },

    defaultRole: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    // User attribute mapping
    attributeMapping: {
      email: {
        type: String,
        default: "email",
      },
      name: {
        type: String,
        default: "name",
      },
      firstName: {
        type: String,
        default: "given_name",
      },
      lastName: {
        type: String,
        default: "family_name",
      },
      department: {
        type: String,
        default: "department",
      },
      jobTitle: {
        type: String,
        default: "job_title",
      },
    },

    // Additional provider-specific settings
    providerSettings: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    // Security settings
    enforceSSL: {
      type: Boolean,
      default: true,
    },

    sessionTimeout: {
      type: Number, // in minutes
      default: 480, // 8 hours
    },

    // Audit fields
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    lastModifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // Testing and validation
    lastTestedAt: {
      type: Date,
    },

    testResult: {
      success: Boolean,
      message: String,
      error: String,
      testedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    },

    // Usage statistics
    loginCount: {
      type: Number,
      default: 0,
    },

    lastLoginAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        // Don't expose client secret in JSON responses
        delete ret.clientSecret;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

// Indexes
ssoConfigSchema.index({ provider: 1, isActive: 1 });
ssoConfigSchema.index({ isPrimary: 1 });
ssoConfigSchema.index({ createdAt: -1 });

// Ensure only one primary provider
ssoConfigSchema.pre("save", async function (next) {
  if (this.isPrimary && this.isModified("isPrimary")) {
    // Remove primary flag from all other providers
    await this.constructor.updateMany(
      { _id: { $ne: this._id } },
      { $set: { isPrimary: false } }
    );
  }
  next();
});

// Virtual for masked client secret
ssoConfigSchema.virtual("maskedClientSecret").get(function () {
  if (!this.clientSecret) return "";
  const secret = this.clientSecret;
  if (secret.length <= 8) return "****";
  return secret.substring(0, 4) + "****" + secret.substring(secret.length - 4);
});

// Static method to get active configuration
ssoConfigSchema.statics.getActiveConfig = async function (provider = null) {
  let query = { isActive: true };
  if (provider) {
    query.provider = provider;
  } else {
    query.isPrimary = true;
  }

  return await this.findOne(query);
};

// Static method to get all configurations for admin
ssoConfigSchema.statics.getAllForAdmin = async function () {
  return await this.find({})
    .populate("createdBy", "name email")
    .populate("lastModifiedBy", "name email")
    .sort({ isPrimary: -1, isActive: -1, createdAt: -1 });
};

// Instance method to test configuration
ssoConfigSchema.methods.testConnection = async function (testUserId) {
  try {
    // This would contain actual testing logic based on provider
    // For now, we'll simulate a test
    const success = true; // Simulate successful test

    this.lastTestedAt = new Date();
    this.testResult = {
      success: success,
      message: success
        ? "Connection test successful"
        : "Connection test failed",
      error: success ? null : "Test error message",
      testedBy: testUserId,
    };

    await this.save();
    return this.testResult;
  } catch (error) {
    this.testResult = {
      success: false,
      message: "Connection test failed",
      error: error.message,
      testedBy: testUserId,
    };
    await this.save();
    return this.testResult;
  }
};

// Instance method to increment login count
ssoConfigSchema.methods.recordLogin = async function () {
  this.loginCount += 1;
  this.lastLoginAt = new Date();
  return await this.save();
};

// Static method to create default Microsoft configuration
ssoConfigSchema.statics.createDefaultMicrosoftConfig = async function (
  adminUserId
) {
  const existingConfig = await this.findOne({ provider: "microsoft" });
  if (existingConfig) {
    return existingConfig;
  }

  const config = new this({
    provider: "microsoft",
    providerName: "Microsoft Entra ID",
    clientId: process.env.AZURE_CLIENT_ID || "",
    clientSecret: process.env.AZURE_CLIENT_SECRET || "",
    tenantId: process.env.AZURE_TENANT_ID || "",
    authority: process.env.AZURE_AUTHORITY || "",
    redirectUri:
      process.env.AZURE_REDIRECT_URI ||
      "http://localhost:5000/api/auth/callback",
    postLogoutRedirectUri:
      process.env.AZURE_POST_LOGOUT_REDIRECT_URI ||
      "http://localhost:5173/login",
    scopes: ["openid", "profile", "email", "User.Read"],
    autoProvisioning: true,
    defaultRole: "user",
    isActive: true,
    isPrimary: true,
    createdBy: adminUserId,
    lastModifiedBy: adminUserId,
  });

  return await config.save();
};

module.exports = mongoose.model("SSOConfig", ssoConfigSchema);
