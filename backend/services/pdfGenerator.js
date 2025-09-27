const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");
const QRCodeService = require("./qrCodeService");

class PDFGeneratorService {
  constructor() {
    this.assetsPath = path.join(__dirname, "../assets");
    this.cardFrontPath = path.join(this.assetsPath, "cardfront.jpg");
    this.cardBackPath = path.join(this.assetsPath, "cardback.jpg");
    this.logoPath = path.join(this.assetsPath, "logo.png");
    
    // Card dimensions (in points - PDFKit uses 72 points per inch)
    this.cardWidth = 85 * 2.834; // 85mm in points
    this.cardHeight = 55 * 2.834; // 55mm in points (standard business card size)
    
    // Standard business card dimensions: 85mm x 55mm
    this.margin = 20;
  }

  /**
   * Generate business card PDF with front and back pages
   * @param {Object} user - User object with profile data
   * @param {string} baseUrl - Base URL for QR code generation
   * @param {Object} options - PDF generation options
   * @returns {Promise<Buffer>} - PDF buffer
   */
  async generateBusinessCardPDF(user, baseUrl, options = {}) {
    try {
      console.log(`Generating business card PDF for user: ${user.name}`);

      // Create PDF document
      const doc = new PDFDocument({
        size: [this.cardWidth, this.cardHeight],
        margins: {
          top: 0,
          bottom: 0,
          left: 0,
          right: 0
        }
      });

      // Collect PDF data
      const chunks = [];
      doc.on('data', chunk => chunks.push(chunk));
      
      const pdfPromise = new Promise((resolve, reject) => {
        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(chunks);
          resolve(pdfBuffer);
        });
        doc.on('error', reject);
      });

      // Generate QR code data URL
      const qrCodeDataUrl = await QRCodeService.getQRCodeDataUrl(user, baseUrl, {
        size: 120,
        logoSize: 30,
        errorCorrectionLevel: "H"
      });

      // Add front page (Card Back - with user info)
      await this.addCardFrontPage(doc, user, qrCodeDataUrl);

      // Add back page (Card Front - company info)
      await this.addCardBackPage(doc, user);

      // Finalize PDF
      doc.end();

      return await pdfPromise;
    } catch (error) {
      console.error("Error generating business card PDF:", error);
      throw new Error(`Failed to generate PDF: ${error.message}`);
    }
  }

  /**
   * Add card front page (user information side)
   * @param {PDFDocument} doc - PDF document instance
   * @param {Object} user - User data
   * @param {string} qrCodeDataUrl - QR code data URL
   */
  async addCardFrontPage(doc, user, qrCodeDataUrl) {
    try {
      // Add new page
      doc.addPage();

      // Load and add background image
      const backgroundImage = await this.loadImageAsBase64(this.cardBackPath);
      doc.image(backgroundImage, 0, 0, {
        width: this.cardWidth,
        height: this.cardHeight,
        fit: [this.cardWidth, this.cardHeight]
      });

      // Add user information overlay
      await this.addUserInformation(doc, user);

      // Add QR code overlay
      await this.addQRCodeOverlay(doc, qrCodeDataUrl);

    } catch (error) {
      console.error("Error adding card front page:", error);
      throw error;
    }
  }

  /**
   * Add card back page (company information side)
   * @param {PDFDocument} doc - PDF document instance
   * @param {Object} user - User data
   */
  async addCardBackPage(doc, user) {
    try {
      // Add new page
      doc.addPage();

      // Load and add background image
      const backgroundImage = await this.loadImageAsBase64(this.cardFrontPath);
      doc.image(backgroundImage, 0, 0, {
        width: this.cardWidth,
        height: this.cardHeight,
        fit: [this.cardWidth, this.cardHeight]
      });

    } catch (error) {
      console.error("Error adding card back page:", error);
      throw error;
    }
  }

  /**
   * Add user information overlay to the card
   * @param {PDFDocument} doc - PDF document instance
   * @param {Object} user - User data
   */
  async addUserInformation(doc, user) {
    try {
      // Set font for user information
      doc.fontSize(10);
      doc.fillColor('#374151'); // Gray-700

      // Name and Title - positioned based on card design
      const nameX = 15;
      const nameY = 45;

      // User name
      doc.fontSize(12)
         .font('Helvetica-Bold')
         .text(user.name || "NOWSHAD HAMEED", nameX, nameY);

      // Job title
      doc.fontSize(8)
         .font('Helvetica-Bold')
         .text(user.jobTitle || user.title || "Chief Executive Officer", nameX, nameY + 15);

      // Contact information
      const contactY = nameY + 35;
      const lineHeight = 12;

      // Email with icons
      if (user.email) {
        doc.fontSize(7)
           .font('Helvetica-Bold')
           .text(`📧 ${user.email}`, nameX, contactY);
      }

      // Phone with icons
      if (user.phone) {
        doc.fontSize(7)
           .font('Helvetica-Bold')
           .text(`📱 ${user.phone}`, nameX, contactY + lineHeight);
      }

      // Second phone if available
      if (user.phone2 || user.businessPhones?.[0]) {
        doc.fontSize(7)
           .font('Helvetica-Bold')
           .text(`📞 ${user.phone2 || user.businessPhones[0]}`, nameX, contactY + (lineHeight * 2));
      }

      // Address
      if (user.address) {
        const addressLines = user.address.split('\n');
        let addressY = contactY + (lineHeight * 3);
        
        addressLines.forEach((line, index) => {
          if (index === 0) {
            doc.fontSize(7)
               .font('Helvetica-Bold')
               .text(`📍 ${line}`, nameX, addressY);
          } else {
            doc.fontSize(7)
               .font('Helvetica-Bold')
               .text(`   ${line}`, nameX, addressY);
          }
          addressY += 8;
        });
      }

      // Website
      doc.fontSize(7)
         .font('Helvetica-Bold')
         .text('🌐 www.exctel.com', nameX, contactY + (lineHeight * 5));

    } catch (error) {
      console.error("Error adding user information:", error);
      throw error;
    }
  }

  /**
   * Add QR code overlay to the card
   * @param {PDFDocument} doc - PDF document instance
   * @param {string} qrCodeDataUrl - QR code data URL
   */
  async addQRCodeOverlay(doc, qrCodeDataUrl) {
    try {
      // QR code position - bottom center with some padding
      const qrSize = 25; // Size in points
      const qrX = (this.cardWidth - qrSize) / 2;
      const qrY = this.cardHeight - qrSize - 15;

      // Add white background for QR code
      doc.rect(qrX - 2, qrY - 2, qrSize + 4, qrSize + 4)
         .fillColor('#FFFFFF')
         .fill();

      // Add QR code
      doc.image(qrCodeDataUrl, qrX, qrY, {
        width: qrSize,
        height: qrSize
      });

    } catch (error) {
      console.error("Error adding QR code overlay:", error);
      throw error;
    }
  }

  /**
   * Load image file and convert to base64 data URL
   * @param {string} imagePath - Path to image file
   * @returns {Promise<string>} - Base64 data URL
   */
  async loadImageAsBase64(imagePath) {
    try {
      if (!fs.existsSync(imagePath)) {
        throw new Error(`Image file not found: ${imagePath}`);
      }

      const imageBuffer = fs.readFileSync(imagePath);
      const mimeType = this.getMimeType(imagePath);
      const base64Data = imageBuffer.toString('base64');
      
      return `data:${mimeType};base64,${base64Data}`;
    } catch (error) {
      console.error(`Error loading image as base64: ${imagePath}`, error);
      throw error;
    }
  }

  /**
   * Get MIME type based on file extension
   * @param {string} filePath - File path
   * @returns {string} - MIME type
   */
  getMimeType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp'
    };
    return mimeTypes[ext] || 'image/jpeg';
  }

  /**
   * Generate PDF for multiple users (batch processing)
   * @param {Array} users - Array of user objects
   * @param {string} baseUrl - Base URL for QR code generation
   * @param {Object} options - PDF generation options
   * @returns {Promise<Array>} - Array of PDF buffers
   */
  async batchGenerateBusinessCards(users, baseUrl, options = {}) {
    const results = [];

    for (const user of users) {
      try {
        if (user.shareId) {
          const pdfBuffer = await this.generateBusinessCardPDF(user, baseUrl, options);
          results.push({
            user: user,
            pdf: pdfBuffer,
            success: true
          });
        } else {
          console.warn(`User ${user.email} has no shareId, skipping PDF generation`);
          results.push({
            user: user,
            pdf: null,
            success: false,
            error: "No shareId"
          });
        }
      } catch (error) {
        console.error(`Failed to generate PDF for user ${user.email}:`, error);
        results.push({
          user: user,
          pdf: null,
          success: false,
          error: error.message
        });
      }
    }

    return results;
  }

  /**
   * Generate a single business card PDF and save to file
   * @param {Object} user - User object
   * @param {string} baseUrl - Base URL for QR code generation
   * @param {string} outputPath - Output file path
   * @param {Object} options - PDF generation options
   * @returns {Promise<string>} - Output file path
   */
  async generateAndSaveBusinessCard(user, baseUrl, outputPath, options = {}) {
    try {
      const pdfBuffer = await this.generateBusinessCardPDF(user, baseUrl, options);
      
      // Ensure output directory exists
      const outputDir = path.dirname(outputPath);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      // Write PDF to file
      fs.writeFileSync(outputPath, pdfBuffer);
      
      console.log(`Business card PDF saved to: ${outputPath}`);
      return outputPath;
    } catch (error) {
      console.error("Error generating and saving business card:", error);
      throw error;
    }
  }
}

module.exports = new PDFGeneratorService();
