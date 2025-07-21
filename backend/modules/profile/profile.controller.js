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
exports.syncProfile = async (req, res) => {
  try {
    const { name, email, department, jobTitle } = req.user;

    // Find existing user
    let user = await User.findOne({ email });

    if (user) {
      // Update SSO fields if they've changed
      const hasChanges =
        user.name !== name ||
        user.email !== email ||
        user.department !== department ||
        user.jobTitle !== jobTitle;

      if (hasChanges) {
        user.name = name;
        user.email = email;
        user.department = department;
        user.jobTitle = jobTitle;
        user.lastActiveAt = new Date();
        await user.save();
      }
    } else {
      // Create new user
      user = await User.create({
        email,
        name,
        department,
        jobTitle,
        loginType: "sso",
        createdBy: "sso",
        lastActiveAt: new Date(),
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
      message: "Profile synced successfully",
    });
  } catch (error) {
    console.error("Error syncing profile:", error);
    res.status(500).json({
      success: false,
      message: "Error syncing profile",
      error: error.message,
    });
  }
};
