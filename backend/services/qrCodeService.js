const QRCode = require("qrcode");
const { createCanvas, loadImage } = require("canvas");
const path = require("path");
const crypto = require("crypto");

class QRCodeService {
  constructor() {
    this.logoPath = path.join(__dirname, "../assets/logo.png");
    this.defaultOptions = {
      size: 200,
      logoSize: 45,
      errorCorrectionLevel: "H",
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    };
  }

  /**
   * Generate QR code with Exctel logo embedded
   * @param {string} data - Data to encode in QR code
   * @param {Object} options - QR code generation options
   * @returns {Promise<string>} - Base64 data URL of the QR code image
   */
  async generateQRCodeWithLogo(data, options = {}) {
    try {
      const opts = { ...this.defaultOptions, ...options };

      // Generate QR code data
      const qrDataUrl = await QRCode.toDataURL(data, {
        errorCorrectionLevel: opts.errorCorrectionLevel,
        type: "image/png",
        quality: 0.92,
        margin: opts.margin,
        color: opts.color,
        width: opts.size,
      });

      // Create canvas for final image
      const canvas = createCanvas(opts.size, opts.size);
      const ctx = canvas.getContext("2d");

      // Load QR code image
      const qrImage = await loadImage(qrDataUrl);

      // Draw QR code background
      ctx.fillStyle = opts.color.light;
      ctx.fillRect(0, 0, opts.size, opts.size);

      // Draw QR code
      ctx.drawImage(qrImage, 0, 0, opts.size, opts.size);

      // Load and draw Exctel logo in center
      try {
        const logo = await loadImage(this.logoPath);

        // Calculate logo position (center of QR code)
        const logoX = (opts.size - opts.logoSize) / 2;
        const logoY = (opts.size - opts.logoSize) / 2;

        // Create rounded rectangle for logo background
        const radius = 5;
        const logoBgSize = opts.logoSize + 4; // Add some padding

        ctx.fillStyle = "#FFFFFF";
        ctx.beginPath();
        ctx.roundRect(logoX - 2, logoY - 2, logoBgSize, logoBgSize, radius);
        ctx.fill();

        // Draw logo
        ctx.drawImage(logo, logoX, logoY, opts.logoSize, opts.logoSize);
      } catch (logoError) {
        console.warn(
          "Could not load logo, generating QR code without logo:",
          logoError.message
        );
      }

      // Convert to data URL
      const dataUrl = canvas.toDataURL("image/png");

      return dataUrl;
    } catch (error) {
      console.error("Error generating QR code with logo:", error);
      throw new Error(`Failed to generate QR code: ${error.message}`);
    }
  }

  /**
   * Generate QR code version for cache busting
   * @param {string} data - Data to encode
   * @returns {string} - Version hash
   */
  generateVersion(data) {
    return crypto.createHash("md5").update(data).digest("hex").substring(0, 8);
  }

  /**
   * Check if QR code needs regeneration
   * @param {Object} user - User object with QR code data
   * @param {string} shareUrl - Current share URL
   * @returns {boolean} - True if regeneration is needed
   */
  needsRegeneration(user, shareUrl) {
    if (!user.qrCode || !user.qrCode.dataUrl) {
      return true;
    }

    const currentVersion = this.generateVersion(shareUrl);
    return user.qrCode.version !== currentVersion;
  }

  /**
   * Generate share URL for user
   * @param {string} shareId - User's share ID
   * @param {string} baseUrl - Base URL of the application
   * @returns {string} - Complete share URL
   */
  generateShareUrl(shareId, baseUrl) {
    return `${baseUrl}share/${shareId}`;
  }

  /**
   * Generate QR code for user and save to database
   * @param {Object} user - User document
   * @param {string} baseUrl - Base URL of the application
   * @param {Object} options - QR code generation options
   * @returns {Promise<Object>} - Updated user with QR code data
   */
  async generateAndSaveQRCode(user, baseUrl, options = {}) {
    try {
      if (!user.shareId) {
        throw new Error("User must have a shareId to generate QR code");
      }

      const shareUrl = this.generateShareUrl(user.shareId, baseUrl);
      const version = this.generateVersion(shareUrl);

      // Check if regeneration is needed
      if (!this.needsRegeneration(user, shareUrl)) {
        console.log(`QR code for user ${user.email} is up to date`);
        return user;
      }

      console.log(`Generating QR code for user ${user.email}...`);

      // Generate QR code
      const qrDataUrl = await this.generateQRCodeWithLogo(shareUrl, options);

      // Update user document
      user.qrCode = {
        dataUrl: qrDataUrl,
        size: options.size || this.defaultOptions.size,
        logoSize: options.logoSize || this.defaultOptions.logoSize,
        generatedAt: new Date(),
        version: version,
      };

      await user.save();

      console.log(`QR code generated successfully for user ${user.email}`);
      return user;
    } catch (error) {
      console.error(`Error generating QR code for user ${user.email}:`, error);
      throw error;
    }
  }

  /**
   * Get QR code data URL for user
   * @param {Object} user - User document
   * @param {string} baseUrl - Base URL of the application
   * @param {Object} options - QR code generation options
   * @returns {Promise<string>} - QR code data URL
   */
  async getQRCodeDataUrl(user, baseUrl, options = {}) {
    try {
      const shareUrl = this.generateShareUrl(user.shareId, baseUrl);

      // Check if we need to regenerate
      if (this.needsRegeneration(user, shareUrl)) {
        await this.generateAndSaveQRCode(user, baseUrl, options);
      }

      return user.qrCode.dataUrl;
    } catch (error) {
      console.error("Error getting QR code data URL:", error);
      throw error;
    }
  }

  /**
   * Batch generate QR codes for multiple users
   * @param {Array} users - Array of user documents
   * @param {string} baseUrl - Base URL of the application
   * @param {Object} options - QR code generation options
   * @returns {Promise<Array>} - Array of updated users
   */
  async batchGenerateQRCodes(users, baseUrl, options = {}) {
    const results = [];

    for (const user of users) {
      try {
        if (user.shareId) {
          const updatedUser = await this.generateAndSaveQRCode(
            user,
            baseUrl,
            options
          );
          results.push(updatedUser);
        } else {
          console.warn(
            `User ${user.email} has no shareId, skipping QR generation`
          );
          results.push(user);
        }
      } catch (error) {
        console.error(
          `Failed to generate QR code for user ${user.email}:`,
          error
        );
        results.push(user); // Keep original user if generation fails
      }
    }

    return results;
  }
}

module.exports = new QRCodeService();
