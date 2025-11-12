const mongoose = require("mongoose");

// Outlook Signature Configuration Schema
const outlookSignatureSchema = new mongoose.Schema(
  {
    signature_name: {
      type: String,
      required: true,
      trim: true,
    },
    user_id: {
      type: String,
      required: true,
      index: true,
    },
    html_template: {
      type: String,
      required: true,
    },
    placeholders: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
      // Stores mapping of placeholder keys to values
      // Example: { FirstName: "John", LastName: "Doe", Title: "Engineer", etc. }
    },
    user_profile: {
      // Stored user profile data for placeholder replacement
      displayName: String,
      firstName: String,
      lastName: String,
      jobTitle: String,
      companyName: String,
      mail: String,
      mobilePhone: String,
      faxNumber: String,
      phoneNumber: String,
      street: String,
      city: String,
      state: String,
      postalCode: String,
      country: String,
      department: String,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    created_by: {
      type: String,
    },
    updated_by: {
      type: String,
    },
    // Metadata
    description: {
      type: String,
      trim: true,
    },
    version: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
outlookSignatureSchema.index({ user_id: 1, is_active: 1 });
outlookSignatureSchema.index({ user_id: 1, createdAt: -1 });

// Model
const OutlookSignature = mongoose.model(
  "OutlookSignature",
  outlookSignatureSchema
);

module.exports = {
  OutlookSignature,
};

