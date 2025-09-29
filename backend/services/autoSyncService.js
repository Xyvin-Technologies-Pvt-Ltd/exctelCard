const cron = require("node-cron");
const {
  autoSyncUsers,
  getSyncStatus,
} = require("../modules/auth/auth.controller");
const UserActivity = require("../modules/users/userActivity.model");

class AutoSyncService {
  constructor() {
    this.isRunning = false;
    this.lastSync = null;
    this.syncInterval = null;
    this.syncStats = {
      totalRuns: 0,
      successfulRuns: 0,
      failedRuns: 0,
      lastError: null,
    };
  }

  /**
   * Start the auto-sync service with scheduled intervals
   * @param {string} cronExpression - Cron expression for sync schedule (default: every 6 hours)
   */
  start(cronExpression = "0 */6 * * *") {
    if (this.syncInterval) {
      console.log("⚠️ Auto-sync service is already running");
      return;
    }

    console.log(
      `🔄 Starting auto-sync service with schedule: ${cronExpression}`
    );

    this.syncInterval = cron.schedule(
      cronExpression,
      async () => {
        await this.performSync();
      },
      {
        scheduled: true,
        timezone: "UTC",
      }
    );

    // Perform initial sync after 30 seconds
    setTimeout(() => {
      this.performSync();
    }, 30000);

    console.log("✅ Auto-sync service started successfully");
  }

  /**
   * Stop the auto-sync service
   */
  stop() {
    if (this.syncInterval) {
      this.syncInterval.destroy();
      this.syncInterval = null;
      console.log("⏹️ Auto-sync service stopped");
    }
  }

  /**
   * Perform a manual sync
   */
  async performSync() {
    if (this.isRunning) {
      console.log("⚠️ Sync already in progress, skipping...");
      return;
    }

    this.isRunning = true;
    this.syncStats.totalRuns++;

    try {
      console.log("🔄 Starting scheduled auto-sync...");

      // Create a mock request object for the controller
      const mockReq = {
        user: { userId: null }, // System sync
        ip: "127.0.0.1",
        get: () => "AutoSyncService/1.0",
      };

      const mockRes = {
        json: (data) => {
          if (data.success) {
            this.syncStats.successfulRuns++;
            this.lastSync = new Date();
            console.log("✅ Scheduled sync completed successfully:", data.data);
          } else {
            this.syncStats.failedRuns++;
            this.syncStats.lastError = data.error;
            console.error("❌ Scheduled sync failed:", data.error);
          }
        },
        status: () => ({
          json: (data) => {
            this.syncStats.failedRuns++;
            this.syncStats.lastError = data.error;
            console.error("❌ Scheduled sync failed:", data.error);
          },
        }),
      };

      await autoSyncUsers(mockReq, mockRes);
    } catch (error) {
      this.syncStats.failedRuns++;
      this.syncStats.lastError = error.message;
      console.error("❌ Error during scheduled sync:", error);
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Get service status and statistics
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      lastSync: this.lastSync,
      stats: this.syncStats,
      nextRun: this.syncInterval ? this.syncInterval.nextDate() : null,
    };
  }

  /**
   * Update sync schedule
   * @param {string} cronExpression - New cron expression
   */
  updateSchedule(cronExpression) {
    if (this.syncInterval) {
      this.stop();
      this.start(cronExpression);
      console.log(`🔄 Sync schedule updated to: ${cronExpression}`);
    }
  }
}

// Create singleton instance
const autoSyncService = new AutoSyncService();

module.exports = autoSyncService;

