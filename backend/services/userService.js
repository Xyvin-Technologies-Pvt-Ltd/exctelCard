const User = require("../modules/users/user.model");

/**
 * User Service
 * Helper functions for user-related operations
 */
class UserService {
  /**
   * Get user by Azure ID (entraId, email, or oid)
   * @param {string} userId - Can be entraId, email, or oid
   * @returns {Promise<Object|null>} User object or null
   */
  async getUserByAzureId(userId) {
    if (!userId) {
      return null;
    }

    try {
      // Try to find by entraId first
      let user = await User.findOne({ entraId: userId });

      // If not found, try by email
      if (!user) {
        user = await User.findOne({ email: userId });
      }

      // If still not found, try by oid (which might be stored in entraId)
      if (!user) {
        user = await User.findOne({ entraId: userId });
      }

      return user;
    } catch (error) {
      console.error("Error fetching user by Azure ID:", error);
      throw error;
    }
  }

  /**
   * Get user preferences
   * @param {string} userId - User identifier
   * @returns {Promise<Object>} User preferences object
   */
  async getUserPreferences(userId) {
    const user = await this.getUserByAzureId(userId);
    if (!user) {
      return {};
    }

    // Return preferences if they exist, otherwise return empty object
    return user.preferences || {};
  }

  /**
   * Update user preferences
   * @param {string} userId - User identifier
   * @param {Object} preferences - Preferences to update
   * @returns {Promise<Object>} Updated user object
   */
  async updateUserPreferences(userId, preferences) {
    const user = await this.getUserByAzureId(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Initialize preferences if they don't exist
    if (!user.preferences) {
      user.preferences = {};
    }

    // Merge new preferences with existing ones
    user.preferences = { ...user.preferences, ...preferences };
    await user.save();

    return user;
  }
}

module.exports = new UserService();

