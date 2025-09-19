const User = require("../users/user.model");
const { v4: uuidv4 } = require("uuid");

/**
 * Get user profile
 */
exports.getProfile = async (req, res) => {
  try {
    const userEmail = req.user.email; // Using email as identifier
    const user = await User.findOne({ email: userEmail });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    res.json({
      success: true,
      profile: {
        userId: user.email,
        name: user.name,
        email: user.email,
        department: user.department,
        jobTitle: user.jobTitle,
        phone: user.phone,
        linkedIn: user.linkedIn,
        profileImage: user.profileImage,
        shareId: user.shareId,
        lastSyncedAt: user.updatedAt,
        lastUpdatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error getting profile:", error);
    res.status(500).json({
      success: false,
      message: "Error getting profile",
      error: error.message,
    });
  }
};

/**
 * Update user profile
 */
exports.updateProfile = async (req, res) => {
  try {
    const userEmail = req.user.email;
    const { phone, linkedIn, profileImage } = req.body;

    // Find and update user
    const user = await User.findOneAndUpdate(
      { email: userEmail },
      {
        phone,
        linkedIn,
        profileImage,
        lastActiveAt: new Date(),
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      profile: {
        userId: user.email,
        name: user.name,
        email: user.email,
        department: user.department,
        jobTitle: user.jobTitle,
        phone: user.phone,
        linkedIn: user.linkedIn,
        profileImage: user.profileImage,
        shareId: user.shareId,
        lastSyncedAt: user.updatedAt,
        lastUpdatedAt: user.updatedAt,
      },
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({
      success: false,
      message: "Error updating profile",
      error: error.message,
    });
  }
};

/**
 * Generate or get share ID
 */
exports.generateShareId = async (req, res) => {
  try {
    const userEmail = req.user.email;
    const user = await User.findOne({ email: userEmail });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // If shareId exists, return it
    if (user.shareId) {
      return res.json({
        success: true,
        shareId: user.shareId,
      });
    }

    // Generate new shareId using the existing method
    user.generateShareId();
    await user.save();

    res.json({
      success: true,
      shareId: user.shareId,
    });
  } catch (error) {
    console.error("Error generating share ID:", error);
    res.status(500).json({
      success: false,
      message: "Error generating share ID",
      error: error.message,
    });
  }
};

/**
 * Sync profile with SSO data
 */
const { Client } = require("@microsoft/microsoft-graph-client");
require("isomorphic-fetch");

exports.syncProfile = async (req, res) => {
  try {
    const { accessToken } = req.user;

    if (!accessToken) {
      return res.status(401).json({
        success: false,
        message: "No access token available. Please re-authenticate.",
      });
    }

    // Initialize Microsoft Graph Client
    const client = Client.init({
      authProvider: (done) => {
        done(null, accessToken);
      },
    });

    // Fetch user data from Microsoft Graph
    const graphUser = await client
      .api("/me")
      .select(
        "id,mail,displayName,department,jobTitle,mobilePhone,businessPhones,officeLocation"
      )
      .get();

    // Find existing user
    let user = await User.findOne({ email: graphUser.mail });
    console.log("👤 User:", graphUser);

    if (user) {
      // Update SSO fields if they've changed
      const hasChanges =
        user.name !== graphUser.displayName ||
        user.email !== graphUser.mail ||
        user.department !== graphUser.department ||
        user.jobTitle !== graphUser.jobTitle ||
        user.phone !==
          (graphUser.mobilePhone || graphUser.businessPhones?.[0]) ||
        user.address !== graphUser.officeLocation;
        user.businessPhones = graphUser.businessPhones;

      if (hasChanges) {
        user.name = graphUser.displayName;
        user.email = graphUser.mail;
        user.department = graphUser.department;
        user.jobTitle = graphUser.jobTitle;
        user.phone =
          graphUser.mobilePhone || graphUser.businessPhones?.[0] || user.phone;
       user.businessPhones = graphUser.businessPhones;
          user.address = graphUser.officeLocation || user.address;
        user.lastActiveAt = new Date();
        await user.save();
      }
    } else {
      // Create new user
      user = await User.create({
        email: graphUser.mail,
        name: graphUser.displayName,
        department: graphUser.department,
        jobTitle: graphUser.jobTitle,
        phone: graphUser.mobilePhone || graphUser.businessPhones?.[0],
        businessPhones: graphUser.businessPhones,
        address: graphUser.officeLocation,
        loginType: "sso",
        createdBy: "sso",
        lastActiveAt: new Date(),
      });
    }

    // Try to fetch user photo if available
    try {
      const photo = await client.api("/me/photo/$value").get();
      if (photo) {
        const photoBuffer = await photo.arrayBuffer();
        const base64Photo = Buffer.from(photoBuffer).toString("base64");
        user.profileImage = `data:image/jpeg;base64,${base64Photo}`;
        await user.save();
      }
    } catch (photoError) {
      console.log(
        "No profile photo available or error fetching photo:",
        photoError.message
      );
    }

    res.json({
      success: true,
      profile: {
        userId: user.email,
        name: user.name,
        email: user.email,
        department: user.department,
        jobTitle: user.jobTitle,
        phone: user.phone,
        businessPhones: user.businessPhones,
        address: user.address,
        linkedIn: user.linkedIn,
        profileImage: user.profileImage,
        shareId: user.shareId,
        lastSyncedAt: user.updatedAt,
        lastUpdatedAt: user.updatedAt,
      },
      message: "Profile synced successfully with Azure AD",
    });
  } catch (error) {
    console.error("Error syncing profile with Azure AD:", error);
    res.status(500).json({
      success: false,
      message: "Error syncing profile with Azure AD",
      error: error.message,
    });
  }
};
