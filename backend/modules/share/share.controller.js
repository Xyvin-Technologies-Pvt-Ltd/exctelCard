const User = require("../users/user.model");
const UserActivity = require("../users/userActivity.model");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const { PKPass } = require("passkit-generator");

/**
 * Get shared profile by share ID (public route)
 */
exports.getSharedProfile = async (req, res) => {
  try {
    const { shareId } = req.params;

    if (!shareId) {
      return res.status(400).json({
        success: false,
        message: "Share ID is required",
      });
    }

    // Find user by shareId
    const user = await User.findOne({ shareId });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    // Return public profile data (only safe fields)
    res.json({
      success: true,
      profile: {
        name: user.name,
        email: user.email,
        department: user.department,
        jobTitle: user.jobTitle,
        phone: user.phone,
        linkedIn: user.linkedIn,
        profileImage: user.profileImage,
        shareId: user.shareId,
        // Don't expose sensitive data like userId, internal IDs, etc.
      },
    });
  } catch (error) {
    console.error("Error getting shared profile:", error);
    res.status(500).json({
      success: false,
      message: "Error loading profile",
      error: error.message,
    });
  }
};

/**
 * Track profile interactions (views, downloads, contact clicks)
 */
exports.trackProfileView = async (req, res) => {
  try {
    const { shareId } = req.params;
    const {
      timestamp,
      userAgent,
      referrer,
      viewType,
      downloadType,
      contactType,
      action,
      url,
      ...metadata
    } = req.body;

    if (!shareId) {
      return res.status(400).json({
        success: false,
        message: "Share ID is required",
      });
    }

    // Find user by shareId
    const user = await User.findOne({ shareId });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    // Prepare update object based on interaction type
    const updateObj = {
      lastViewedAt: new Date(),
      "analytics.lastInteractionAt": new Date(),
    };

    // Set first view timestamp if this is the first interaction
    const isFirstView =
      user.analytics?.firstViewAt === null || !user.analytics?.firstViewAt;
    if (isFirstView) {
      updateObj["analytics.firstViewAt"] = new Date();
    }

    // Track different types of interactions
    switch (viewType) {
      case "website_view":
        updateObj.$inc = {
          profileViewCount: 1,
          "analytics.websiteViews": 1,
        };
        console.log(`📊 Website view tracked for ${user.name} (${shareId})`);
        await UserActivity.trackActivity({
          userId: user._id,
          activityType: "website_view",
          source: "share",
          visitorInfo: {
            ipAddress: req.ip,
            userAgent: req.get("User-Agent"),
          },
        });
        break;

      case "profile_view":
        updateObj.$inc = {
          profileViewCount: 1,
          "analytics.profileViews": 1,
        };
        console.log(`👁️ Profile view tracked for ${user.name} (${shareId})`);
        await UserActivity.trackActivity({
          userId: user._id,
          activityType: "profile_view",
          source: "share",
          visitorInfo: {
            ipAddress: req.ip,
            userAgent: req.get("User-Agent"),
          },
        });
        break;

      case "download":
        updateObj.$inc = {
          "analytics.downloads": 1,
        };

        // Track specific download types
        if (downloadType === "vcard") {
          updateObj.$inc["analytics.vcardDownloads"] = 1;
          console.log(`📥 vCard download tracked for  (${shareId})`);
        } else if (downloadType === "link_copy") {
          updateObj.$inc["analytics.linkCopies"] = 1;
          console.log(`🔗 Link copy tracked for ${user.name} (${shareId})`);
          await UserActivity.trackActivity({
            userId: user._id,
            activityType: "link_click",
            source: "share_link",
            visitorInfo: {
              ipAddress: req.ip,
              userAgent: req.get("User-Agent"),
            },
          });
        }
        break;

      case "contact_interaction":
        updateObj.$inc = {
          "analytics.contactInteractions": 1,
        };

        // Track specific contact types
        if (contactType === "email") {
          updateObj.$inc["analytics.emailClicks"] = 1;
          console.log(`📧 Email click tracked for ${user.name} (${shareId})`);
        } else if (contactType === "phone") {
          updateObj.$inc["analytics.phoneClicks"] = 1;
          console.log(`📞 Phone click tracked for ${user.name} (${shareId})`);
        } else if (contactType === "linkedin") {
          updateObj.$inc["analytics.linkedinClicks"] = 1;
          console.log(
            `💼 LinkedIn click tracked for ${user.name} (${shareId})`
          );
          await UserActivity.trackActivity({
            userId: user._id,
            activityType: "link_click",
            source: "share_link",
            visitorInfo: {
              ipAddress: req.ip,
              userAgent: req.get("User-Agent"),
            },
          });
        }
        break;

      default:
        // Default to profile view
        updateObj.$inc = {
          profileViewCount: 1,
          "analytics.profileViews": 1,
        };
        console.log(`👁️ Default view tracked for ${user.name} (${shareId})`);
        //add log for default view
        await UserActivity.trackActivity({
          userId: user._id,
          activityType: "profile_view",
          source: "share_link",
          visitorInfo: {
            ipAddress: req.ip,
            userAgent: req.get("User-Agent"),
          },
        });
    }

    // Update user analytics
    await User.findOneAndUpdate({ shareId }, updateObj);

    res.json({
      success: true,
      message: "Interaction tracked successfully",
      trackingType: viewType || "profile_view",
    });
  } catch (error) {
    console.error("Error tracking profile interaction:", error);
    // Don't fail the request if tracking fails
    res.status(200).json({
      success: false,
      message: "Tracking failed but profile is accessible",
      error: error.message,
    });
  }
};

/**
 * Generate PDF business card using PDFKit
 */
const generatePdf = async (user) => {
  return new Promise((resolve, reject) => {
    try {
      // Create a new PDF document
      const doc = new PDFDocument({
        size: [85.6, 53.98], // Standard business card size in mm
        margin: 0,
        info: {
          Title: `${user.name} - Business Card`,
          Author: "ExctelCard",
          Subject: "Digital Business Card",
        },
      });

      // Create a buffer to store the PDF
      const buffers = [];
      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // Generate front side
      generateFrontSide(doc, user);

      // Add new page for back side
      doc.addPage();
      generateBackSide(doc, user);

      // Finalize the PDF
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Generate front side of business card
 */
const generateFrontSide = (doc, user) => {
  const cardWidth = 85.6;
  const cardHeight = 53.98;

  // Background
  doc.rect(0, 0, cardWidth, cardHeight).fill("#f0f1f1");

  // Orange accent shape (similar to UI design)
  // Create a simple rectangular accent
  doc.rect(0, 0, 35, cardHeight).fill("#ff6b35");

  // Name
  doc
    .fontSize(12)
    .fillColor("#1f2937")
    .text(user.name || "Nowshad Hameed", 10, 15, {
      width: cardWidth - 20,
      align: "left",
    });

  // Job Title
  doc
    .fontSize(8)
    .fillColor("#6b7280")
    .text(user.jobTitle || "Chief Executive Officer", 10, 25, {
      width: cardWidth - 20,
      align: "left",
    });

  // Contact Information
  let yPos = 35;
  const contactInfo = [
    { icon: "✉", text: user.email || "nowshad.hameed@exctel.com" },
    { icon: "📞", text: user.phone || "+65 9027 7225" },
    { icon: "📞", text: user.phone2 || "+65 6714 6714 ext 108" },
    {
      icon: "📍",
      text:
        user.address ||
        "7791 Jalan Bukit Merah\n#06-14 E-Centre @ Redhill\nSingapore 159471",
    },
    { icon: "🌐", text: user.website || "www.exctel.com" },
  ];

  contactInfo.forEach((contact) => {
    if (contact.text) {
      doc
        .fontSize(6)
        .fillColor("#374151")
        .text(`${contact.icon} ${contact.text}`, 10, yPos, {
          width: cardWidth - 20,
          align: "left",
        });
      yPos += contact.text.includes("\n") ? 12 : 8;
    }
  });

  // Company logo area (bottom right)
  doc.rect(cardWidth - 25, cardHeight - 15, 20, 10).fill("#e5e7eb");

  doc
    .fontSize(6)
    .fillColor("#6b7280")
    .text("EXCTEL", cardWidth - 23, cardHeight - 10, {
      width: 16,
      align: "center",
    });
};

/**
 * Generate back side of business card
 */
const generateBackSide = (doc, user) => {
  const cardWidth = 85.6;
  const cardHeight = 53.98;

  // Background
  doc.rect(0, 0, cardWidth, cardHeight).fill("#ffffff");

  // Background pattern (simplified version of the UI design)
  doc.rect(0, 0, cardWidth, cardHeight).fill("#f8fafc");

  // Certification badges area
  const badgeY = 15;
  const badgeSize = 8;
  const badges = ["BizSafe", "ISO", "Excellence"];

  badges.forEach((badge, index) => {
    const x = 15 + index * 20;
    doc
      .circle(x + badgeSize / 2, badgeY + badgeSize / 2, badgeSize / 2)
      .fill("#f3f4f6");

    doc
      .fontSize(4)
      .fillColor("#6b7280")
      .text(badge, x, badgeY + 2, {
        width: badgeSize,
        align: "center",
      });
  });

  // Additional badges row
  const badges2 = ["BizSafe", "ISO"];
  badges2.forEach((badge, index) => {
    const x = 25 + index * 25;
    const y = badgeY + 15;
    doc
      .circle(x + badgeSize / 2, y + badgeSize / 2, badgeSize / 2)
      .fill("#f3f4f6");

    doc
      .fontSize(4)
      .fillColor("#6b7280")
      .text(badge, x, y + 2, {
        width: badgeSize,
        align: "center",
      });
  });

  // QR Code area (simplified representation)
  const qrSize = 20;
  const qrX = (cardWidth - qrSize) / 2;
  const qrY = cardHeight - 25;

  doc.rect(qrX, qrY, qrSize, qrSize).fill("#ffffff").stroke("#e5e7eb");

  // QR Code placeholder text
  doc
    .fontSize(4)
    .fillColor("#9ca3af")
    .text("QR CODE", qrX, qrY + 8, {
      width: qrSize,
      align: "center",
    });

  // Company branding
  doc
    .fontSize(6)
    .fillColor("#6b7280")
    .text("EXCTEL", 5, cardHeight - 8, {
      width: cardWidth - 10,
      align: "center",
    });
};

/**
 * Download PDF business card
 */
/**
 * Generate Apple Wallet pass
 */
const generateWalletPass = async (user) => {
  try {
    // Load Apple Wallet certificates
    const wwdr = fs.readFileSync(path.join(__dirname, "../../certs/wwdr.pem"));
    const signerCert = fs.readFileSync(
      path.join(__dirname, "../../certs/signerCert.pem")
    );
    const signerKey = fs.readFileSync(
      path.join(__dirname, "../../certs/signerKey.pem")
    );

    // Create a new pass
    const pass = new PKPass({
      model: path.join(__dirname, "../../models/businessCard.pass"),
      certificates: {
        wwdr,
        signerCert,
        signerKey,
        signerKeyPassphrase: process.env.WALLET_CERT_PASSPHRASE, // Optional if your key has a passphrase
      },
    });

    // Set pass data
    pass.setBarcodes({
      message: `https://exctelcard.xyvin.com/share/${user.shareId}`,
      format: "PKBarcodeFormatQR",
      messageEncoding: "iso-8859-1",
    });

    // Set pass structure
    pass.setData({
      // Standard Keys
      description: `${user.name}'s Business Card`,
      formatVersion: 1,
      organizationName: "ExctelCard",
      passTypeIdentifier: "pass.com.exctelcard.businesscard",
      serialNumber: user.shareId,
      teamIdentifier: process.env.APPLE_TEAM_ID,

      // Visual Appearance
      logoText: "ExctelCard",
      foregroundColor: "rgb(255, 255, 255)",
      backgroundColor: "rgb(255, 107, 53)", // Orange color

      // Business Card Information
      generic: {
        primaryFields: [
          {
            key: "name",
            label: "Name",
            value: user.name,
          },
        ],
        secondaryFields: [
          {
            key: "title",
            label: "Title",
            value: user.jobTitle || "",
          },
          {
            key: "department",
            label: "Department",
            value: user.department || "",
          },
        ],
        auxiliaryFields: [
          {
            key: "email",
            label: "Email",
            value: user.email,
          },
          {
            key: "phone",
            label: "Phone",
            value: user.phone || "",
          },
        ],
        backFields: [
          {
            key: "company",
            label: "Company",
            value: "Exctel",
          },
          {
            key: "address",
            label: "Address",
            value: user.address || "",
          },
          {
            key: "website",
            label: "Website",
            value: "www.exctel.com",
          },
        ],
      },
    });

    // Generate pass buffer
    return await pass.generate();
  } catch (error) {
    console.error("Error generating wallet pass:", error);
    throw error;
  }
};

/**
 * Download Apple Wallet pass
 */
exports.downloadWalletPass = async (req, res) => {
  try {
    const { shareId } = req.params;
    const {
      timestamp,
      userAgent,
      referrer,
      viewType,
      downloadType,
      url,
      ...metadata
    } = req.body;

    if (!shareId) {
      return res.status(400).json({
        success: false,
        message: "Share ID is required",
      });
    }

    // Get user by shareId
    const user = await User.findOne({ shareId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Track pass download
    await User.findOneAndUpdate(
      { shareId },
      {
        $inc: {
          "analytics.downloads": 1,
          "analytics.walletPasses": 1,
        },
        "analytics.lastInteractionAt": new Date(),
      }
    );

    // Generate pass
    const passBuffer = await generateWalletPass(user);

    // Set response headers
    res.setHeader("Content-Type", "application/vnd.apple.pkpass");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${user.name.replace(/\s+/g, "-")}.pkpass"`
    );
    res.setHeader("Content-Length", passBuffer.length);

    // Send pass
    res.send(passBuffer);
  } catch (error) {
    console.error("Error downloading wallet pass:", error);
    res.status(500).json({
      success: false,
      message: "Error downloading wallet pass",
      error: error.message,
    });
  }
};

/**
 * Download PDF business card
 */
exports.downloadPdf = async (req, res) => {
  try {
    const { shareId } = req.params;
    const {
      timestamp,
      userAgent,
      referrer,
      viewType,
      downloadType,
      url,
      ...metadata
    } = req.body;

    if (!shareId) {
      return res.status(400).json({
        success: false,
        message: "Share ID is required",
      });
    }

    // Get user by shareId
    const user = await User.findOne({ shareId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Track PDF download
    await User.findOneAndUpdate(
      { shareId },
      {
        $inc: {
          "analytics.downloads": 1,
          "analytics.vcardDownloads": 1,
        },
        "analytics.lastInteractionAt": new Date(),
      }
    );

    // Generate PDF
    const pdfBuffer = await generatePdf(user);

    // Set response headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${user.name}-business-card.pdf"`
    );
    res.setHeader("Content-Length", pdfBuffer.length);

    // Send PDF
    res.send(pdfBuffer);
  } catch (error) {
    console.error("Error downloading PDF:", error);
    res.status(500).json({
      success: false,
      message: "Error downloading PDF",
      error: error.message,
    });
  }
};
