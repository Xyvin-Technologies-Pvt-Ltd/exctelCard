const QRCode = require("qrcode");
const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");
const path = require("path");
const QRCodeModel = require("./qrcode.model");
const User = require("../users/user.model");
const { authenticateToken } = require("../../middlewares/auth.middleware");

/**
 * Generate QR code with logo overlay
 */
const generateQRWithLogo = async (text, options = {}) => {
  const {
    size = 200,
    logoSize = 45,
    logoPath = path.join(__dirname, "../../../frontend/public/logo.png"),
    level = "H",
    bgColor = "#FFFFFF",
    fgColor = "#000000",
  } = options;

  try {
    // Generate QR code as data URL
    const qrDataURL = await QRCode.toDataURL(text, {
      width: size,
      margin: 2,
      color: {
        dark: fgColor,
        light: bgColor,
      },
      errorCorrectionLevel: level,
    });

    // Create canvas for final image
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext("2d");

    // Load QR code image
    const qrImage = await loadImage(qrDataURL);
    ctx.drawImage(qrImage, 0, 0, size, size);

    // Try to load and overlay logo
    try {
      if (fs.existsSync(logoPath)) {
        const logo = await loadImage(logoPath);

        // Calculate logo position (center of QR code)
        const logoX = (size - logoSize) / 2;
        const logoY = (size - logoSize) / 2;

        // Create white background for logo
        ctx.fillStyle = bgColor;
        ctx.fillRect(logoX - 2, logoY - 2, logoSize + 4, logoSize + 4);

        // Draw logo
        ctx.drawImage(logo, logoX, logoY, logoSize, logoSize);
      }
    } catch (logoError) {
      console.warn("Could not load logo:", logoError.message);
      // Continue without logo
    }

    return canvas.toDataURL("image/png");
  } catch (error) {
    console.error("Error generating QR code with logo:", error);
    throw error;
  }
};

/**
 * Generate QR code (without logo)
 */
const generateQRCode = async (text, options = {}) => {
  const {
    size = 200,
    level = "H",
    bgColor = "#FFFFFF",
    fgColor = "#000000",
  } = options;

  try {
    return await QRCode.toDataURL(text, {
      width: size,
      margin: 2,
      color: {
        dark: fgColor,
        light: bgColor,
      },
      errorCorrectionLevel: level,
    });
  } catch (error) {
    console.error("Error generating QR code:", error);
    throw error;
  }
};

/**
 * Get QR code history for user
 */
const getQRHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const qrCodes = await QRCodeModel.find({ userId, isActive: true })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      data: qrCodes,
    });
  } catch (error) {
    console.error("Error fetching QR history:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch QR code history",
    });
  }
};

/**
 * Generate new QR code
 */
const generateQRCodeEndpoint = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      shareId,
      qrData,
      size = 200,
      logoSize = 45,
      logoPath = "/logo.png",
      level = "H",
      bgColor = "#FFFFFF",
      fgColor = "#000000",
    } = req.body;

    if (!shareId || !qrData) {
      return res.status(400).json({
        success: false,
        message: "Share ID and QR data are required",
      });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if QR code already exists for this shareId
    const existingQR = await QRCodeModel.findOne({ shareId, userId });
    if (existingQR) {
      return res.json({
        success: true,
        data: existingQR,
        message: "QR code already exists for this share ID",
      });
    }

    // Generate QR code without logo
    const qrImageUrl = await generateQRCode(qrData, {
      size,
      level,
      bgColor,
      fgColor,
    });

    // Generate QR code with logo
    const qrImageWithLogoUrl = await generateQRWithLogo(qrData, {
      size,
      logoSize,
      logoPath,
      level,
      bgColor,
      fgColor,
    });

    // Save to database
    const qrCode = new QRCodeModel({
      userId,
      shareId,
      qrData,
      qrImageUrl,
      qrImageWithLogoUrl,
      logoPath,
      size,
      logoSize,
      level,
      bgColor,
      fgColor,
    });

    await qrCode.save();

    res.json({
      success: true,
      data: qrCode,
      message: "QR code generated successfully",
    });
  } catch (error) {
    console.error("Error generating QR code:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate QR code",
    });
  }
};

/**
 * Update QR code
 */
const updateQRCode = async (req, res) => {
  try {
    const { qrId } = req.params;
    const userId = req.user.id;
    const updateData = req.body;

    const qrCode = await QRCodeModel.findOne({ _id: qrId, userId });
    if (!qrCode) {
      return res.status(404).json({
        success: false,
        message: "QR code not found",
      });
    }

    // If QR data is being updated, regenerate the QR codes
    if (updateData.qrData) {
      const qrImageUrl = await generateQRCode(updateData.qrData, {
        size: updateData.size || qrCode.size,
        level: updateData.level || qrCode.level,
        bgColor: updateData.bgColor || qrCode.bgColor,
        fgColor: updateData.fgColor || qrCode.fgColor,
      });

      const qrImageWithLogoUrl = await generateQRWithLogo(updateData.qrData, {
        size: updateData.size || qrCode.size,
        logoSize: updateData.logoSize || qrCode.logoSize,
        logoPath: updateData.logoPath || qrCode.logoPath,
        level: updateData.level || qrCode.level,
        bgColor: updateData.bgColor || qrCode.bgColor,
        fgColor: updateData.fgColor || qrCode.fgColor,
      });

      updateData.qrImageUrl = qrImageUrl;
      updateData.qrImageWithLogoUrl = qrImageWithLogoUrl;
    }

    const updatedQRCode = await QRCodeModel.findByIdAndUpdate(
      qrId,
      updateData,
      { new: true }
    );

    res.json({
      success: true,
      data: updatedQRCode,
      message: "QR code updated successfully",
    });
  } catch (error) {
    console.error("Error updating QR code:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update QR code",
    });
  }
};

/**
 * Delete QR code
 */
const deleteQRCode = async (req, res) => {
  try {
    const { qrId } = req.params;
    const userId = req.user.id;

    const qrCode = await QRCodeModel.findOne({ _id: qrId, userId });
    if (!qrCode) {
      return res.status(404).json({
        success: false,
        message: "QR code not found",
      });
    }

    // Soft delete
    qrCode.isActive = false;
    await qrCode.save();

    res.json({
      success: true,
      message: "QR code deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting QR code:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete QR code",
    });
  }
};

/**
 * Get QR code analytics
 */
const getQRAnalytics = async (req, res) => {
  try {
    const { qrId } = req.params;
    const userId = req.user.id;

    const qrCode = await QRCodeModel.findOne({ _id: qrId, userId });
    if (!qrCode) {
      return res.status(404).json({
        success: false,
        message: "QR code not found",
      });
    }

    res.json({
      success: true,
      data: {
        scanCount: qrCode.scanCount,
        lastScannedAt: qrCode.lastScannedAt,
        createdAt: qrCode.createdAt,
        shareId: qrCode.shareId,
      },
    });
  } catch (error) {
    console.error("Error fetching QR analytics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch QR code analytics",
    });
  }
};

/**
 * Track QR code scan
 */
const trackQRScan = async (req, res) => {
  try {
    const { shareId } = req.params;

    const qrCode = await QRCodeModel.findOne({ shareId, isActive: true });
    if (!qrCode) {
      return res.status(404).json({
        success: false,
        message: "QR code not found",
      });
    }

    // Update scan count and last scanned time
    qrCode.scanCount += 1;
    qrCode.lastScannedAt = new Date();
    await qrCode.save();

    res.json({
      success: true,
      message: "QR code scan tracked",
    });
  } catch (error) {
    console.error("Error tracking QR scan:", error);
    res.status(500).json({
      success: false,
      message: "Failed to track QR code scan",
    });
  }
};

module.exports = {
  getQRHistory,
  generateQRCodeEndpoint,
  updateQRCode,
  deleteQRCode,
  getQRAnalytics,
  trackQRScan,
  generateQRWithLogo,
  generateQRCode,
};

