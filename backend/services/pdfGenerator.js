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
      // Card dimensions: 241 points wide x 156 points tall (85mm x 55mm)
      // Frontend card: ~350px wide, aspect ratio 0.62 = ~217px tall
      // Frontend positions: name at top-[130px], contact at top-[220px]
      // Convert to PDF points proportionally:
      // Name: 130/217 * 156 = ~94 points (but card is only 156 tall, so adjust)
      // Actually frontend uses absolute positioning, so let's use proportional values
      
      // Left margin: frontend uses ml-6 (24px) + left-4 (16px) = 40px
      // On 350px card = 40/350 * 241 = ~28 points
      const nameX = 28;
      // Name position: frontend top-[130px] on ~400px display ≈ 32.5% = 51 points
      // But visually better at ~55 points (accounting for card design)
      const nameY = 55;
      
      const contactX = 28;
      // Contact position: frontend top-[220px], but that's beyond card height
      // Use proportional: name + spacing + title = ~80 points, contact starts ~95
      const contactStartY = 95; // Start contact info here
      
      const lineHeight = 13; // Spacing between contact lines for readability
      const iconSpacing = 20; // Space reserved for icons (frontend uses SVG icons)

      // User name
      doc.fontSize(16)
         .font('Helvetica-Bold')
         .fillColor('#111827') // Gray-900
         .text(user.name || "NOWSHAD HAMEED", nameX, nameY, {
           align: 'left',
           lineGap: 2
         });

      // Job title - positioned below name with proper spacing
      doc.fontSize(10)
         .font('Helvetica-Bold')
         .fillColor('#4B5563') // Gray-600
         .text(user.jobTitle || user.title || "Chief Executive Officer", nameX, nameY + 20, {
           align: 'left',
           lineGap: 2
         });

      // Contact information - positioned to match frontend layout
      // Use Unicode symbols for icons that align properly with text
      let currentY = contactStartY;
      const fontSize = 9;
      const textColor = '#374151'; // Gray-700
      const iconGap = 6; // Space between icon and text (matching frontend mr-2 = 8px ≈ 6 points)

      // Helper function to add text with icon, properly aligned on same line
      // Combine icon and text as a single string to ensure perfect baseline alignment
      const addTextWithIcon = (icon, text, yPos) => {
        // Combine icon and text with a space - this ensures they render on the same baseline
        const combinedText = icon + ' ' + text;
        
        // Render as single string - PDFKit will align them on the same baseline
        doc.fontSize(fontSize)
           .font('Helvetica-Bold')
           .fillColor(textColor)
           .text(combinedText, contactX, yPos, {
             align: 'left',
             width: this.cardWidth - contactX - 10,
             lineGap: 1
           });
      };

      // Email - using envelope emoji
      if (user.email) {
        addTextWithIcon('✉', user.email, currentY);
        currentY += lineHeight;
      }

      // Phone - using mobile phone emoji
      if (user.phone) {
        addTextWithIcon('📱', user.phone, currentY);
        currentY += lineHeight;
      }

      // Second phone if available - using phone emoji
      if (user.phone2 || user.businessPhones?.[0]) {
        addTextWithIcon('📞', user.phone2 || user.businessPhones[0], currentY);
        currentY += lineHeight;
      }

      // Address - handle multi-line with proper alignment
      if (user.address) {
        const addressLines = user.address.split('\n').filter(line => line.trim());
        // Approximate width of icon + space for indentation
        const iconSpace = fontSize * 1.5; // Space for icon + space character
        addressLines.forEach((line, index) => {
          if (index === 0) {
            // First line with location icon
            addTextWithIcon('📍', line.trim(), currentY);
          } else {
            // Subsequent lines without icon, indented to match first line text position
            doc.fontSize(fontSize)
               .font('Helvetica-Bold')
               .fillColor(textColor)
               .text(line.trim(), contactX + iconSpace, currentY, {
                 align: 'left',
                 width: this.cardWidth - contactX - iconSpace - 10,
                 lineGap: 1
               });
          }
          currentY += (index === 0 ? lineHeight : 9); // First line normal spacing, subsequent lines slightly tighter
        });
        currentY += 2; // Small spacing after address
      }

      // Website - using globe emoji
      addTextWithIcon('🌐', 'www.exctel.com', currentY);

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
      // QR code position - bottom center with padding (matching frontend: bottom-5 = 20px)
      // Frontend uses size 70px for mobile, 100px for desktop
      // For PDF, use a proportional size: ~30 points (about 10.6mm)
      const qrSize = 30; // Size in points
      const padding = 15; // Bottom padding in points (matching frontend bottom-5 ≈ 20px)
      
      // Center horizontally
      const qrX = (this.cardWidth - qrSize) / 2;
      // Position from bottom with padding
      const qrY = this.cardHeight - qrSize - padding;

      // Add white background for QR code (matching frontend: bg-white bg-opacity-90)
      const bgPadding = 3; // Padding around QR code
      doc.rect(qrX - bgPadding, qrY - bgPadding, qrSize + (bgPadding * 2), qrSize + (bgPadding * 2))
         .fillColor('#FFFFFF')
         .fillOpacity(0.9)
         .fill();

      // Add QR code
      doc.image(qrCodeDataUrl, qrX, qrY, {
        width: qrSize,
        height: qrSize,
        align: 'center',
        valign: 'center'
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



