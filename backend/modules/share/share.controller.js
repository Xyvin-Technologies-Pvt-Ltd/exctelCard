const User = require("../users/user.model");
const UserActivity = require("../users/userActivity.model");
const PDFGeneratorService = require("../../services/pdfGenerator");

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
        if (downloadType === "vcardDownloads") {
          updateObj.$inc["analytics.vcardDownloads"] = 1;
          console.log(`📥 vCard download tracked for  (${shareId})`);
        } else if (downloadType === "qrcodeDownloads") {
          updateObj.$inc["analytics.qrcodeDownloads"] = 1;
          console.log(`🔗 Link copy tracked for ${user.name} (${shareId})`);
        } else if (downloadType === "bizcardDownloads") {
          updateObj.$inc["analytics.bizcardDownloads"] = 1;
          console.log(`🔗 Link copy tracked for ${user.name} (${shareId})`);
        }

        break;

      default:
        //do nothing
        console.log(`👁️ Default view tracked for ${user.name} (${shareId})`);
      //add log for default view
    }

    // Update user analytics
    await User.findOneAndUpdate({ shareId }, updateObj);

    res.json({
      success: true,
      message: "Interaction tracked successfully",
      trackingType: viewType || "default",
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
 * Download business card PDF
 */
exports.downloadBizCard = async (req, res) => {
  try {
    const { shareId } = req.params;
    console.log("Downloading biz card for:", shareId);

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

    // Generate base URL for QR code
    const baseUrl =
      process.env.FRONTEND_URL || `${req.protocol}://${req.get("host")}`;

    console.log(
      `Generating business card PDF for user: ${user.name} (${shareId})`
    );

    // Generate PDF
    const pdfBuffer = await PDFGeneratorService.generateBusinessCardPDF(
      user,
      baseUrl
    );

    // Set response headers for PDF download
    const fileName = `business-card-${user.name
      .replace(/\s+/g, "-")
      .toLowerCase()}-${shareId}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.setHeader("Content-Length", pdfBuffer.length);

    // Send PDF buffer
    res.send(pdfBuffer);

    // Track download activity
    try {
      await UserActivity.trackActivity({
        userId: user._id,
        activityType: "bizcardDownloads",
        visitorInfo: {
          ipAddress: req.ip,
          userAgent: req.get("User-Agent"),
        },
      });

      // Update analytics
      await User.findOneAndUpdate(
        { shareId },
        {
          $inc: { "analytics.bizcardDownloads": 1 },
          lastViewedAt: new Date(),
          "analytics.lastInteractionAt": new Date(),
        }
      );
    } catch (trackingError) {
      console.warn("Failed to track download activity:", trackingError);
      // Don't fail the request if tracking fails
    }
  } catch (error) {
    console.error("Error downloading biz card:", error);
    res.status(500).json({
      success: false,
      message: "Error generating business card PDF",
      error: error.message,
    });
  }
};
