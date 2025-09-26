const mongoose = require("mongoose");

const qrCodeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    shareId: {
      type: String,
      required: true,
      unique: true,
    },
    qrData: {
      type: String,
      required: true,
    },
    qrImageUrl: {
      type: String,
      required: true,
    },
    qrImageWithLogoUrl: {
      type: String,
      required: false,
    },
    logoPath: {
      type: String,
      default: "/logo.png",
    },
    size: {
      type: Number,
      default: 200,
    },
    logoSize: {
      type: Number,
      default: 45,
    },
    level: {
      type: String,
      enum: ["L", "M", "Q", "H"],
      default: "H",
    },
    bgColor: {
      type: String,
      default: "#FFFFFF",
    },
    fgColor: {
      type: String,
      default: "#000000",
    },
    scanCount: {
      type: Number,
      default: 0,
    },
    lastScannedAt: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
qrCodeSchema.index({ userId: 1 });
qrCodeSchema.index({ shareId: 1 });
qrCodeSchema.index({ isActive: 1 });

module.exports = mongoose.model("QRCode", qrCodeSchema);

