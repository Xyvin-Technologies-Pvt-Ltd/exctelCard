const User = require("../users/user.model");

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
        break;

      case "profile_view":
        updateObj.$inc = {
          profileViewCount: 1,
          "analytics.profileViews": 1,
        };
        console.log(`👁️ Profile view tracked for ${user.name} (${shareId})`);
        break;

      case "download":
        updateObj.$inc = {
          "analytics.downloads": 1,
        };

        // Track specific download types
        if (downloadType === "vcard") {
          updateObj.$inc["analytics.vcardDownloads"] = 1;
          console.log(
            `📥 vCard download tracked for ${user.name} (${shareId})`
          );
        } else if (downloadType === "link_copy") {
          updateObj.$inc["analytics.linkCopies"] = 1;
          console.log(`🔗 Link copy tracked for ${user.name} (${shareId})`);
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
        }
        break;

      default:
        // Default to profile view
        updateObj.$inc = {
          profileViewCount: 1,
          "analytics.profileViews": 1,
        };
        console.log(`👁️ Default view tracked for ${user.name} (${shareId})`);
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
