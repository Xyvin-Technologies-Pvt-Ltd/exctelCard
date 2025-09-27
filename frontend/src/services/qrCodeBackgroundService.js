import { getUsers } from "../api/users";
import { QRCodeSVG } from "qrcode.react";

class QRCodeBackgroundService {
  constructor() {
    this.isGenerating = false;
    this.generationQueue = new Set();
    this.completedGenerations = new Set();
    this.generationStatus = new Map(); // userId -> { status, progress, error }
    this.generatedQRCodes = new Map(); // userId -> { qrData, timestamp }
  }

  /**
   * Start background QR code generation for all users
   */
  async startBackgroundGeneration() {
    if (this.isGenerating) {
      console.log("QR code generation already in progress");
      return;
    }

    try {
      this.isGenerating = true;
      console.log("🚀 Starting background QR code generation...");

      // Get all users
      const usersData = await getUsers();
      const users = usersData?.users || [];

      if (users.length === 0) {
        console.log("No users found for QR code generation");
        return;
      }

      console.log(
        `📊 Found ${users.length} users, starting QR code generation...`
      );

      // Process users in batches to avoid overwhelming the server
      const batchSize = 5;
      const batches = [];

      for (let i = 0; i < users.length; i += batchSize) {
        batches.push(users.slice(i, i + batchSize));
      }

      let completedCount = 0;
      const totalCount = users.length;

      // Process each batch
      for (const batch of batches) {
        const batchPromises = batch.map(async (user) => {
          try {
            // Check if user has shareId
            if (!user.shareId) {
              console.log(
                `⚠️ User ${user.name} has no shareId, skipping QR generation`
              );
              this.generationStatus.set(user._id, {
                status: "skipped",
                progress: 100,
                error: "No shareId",
              });
              return;
            }

            // Check if already generated
            if (this.completedGenerations.has(user._id)) {
              console.log(`✅ QR code already generated for ${user.name}`);
              return;
            }

            this.generationStatus.set(user._id, {
              status: "generating",
              progress: 0,
              error: null,
            });

            // Generate QR code data (client-side)
            const qrUrl = `${window.location.protocol}//${window.location.hostname}/share/${user.shareId}`;

            // Store the QR code data for later use
            this.generatedQRCodes.set(user._id, {
              qrData: qrUrl,
              shareId: user.shareId,
              size: 200,
              logoSize: 45,
              logoPath: "/logo.png",
              level: "H",
              bgColor: "#FFFFFF",
              fgColor: "#000000",
              timestamp: Date.now(),
            });

            this.completedGenerations.add(user._id);
            this.generationStatus.set(user._id, {
              status: "completed",
              progress: 100,
              error: null,
            });

            completedCount++;
            console.log(
              `✅ Generated QR code for ${user.name} (${completedCount}/${totalCount})`
            );
          } catch (error) {
            console.error(
              `❌ Failed to generate QR code for ${user.name}:`,
              error
            );
            this.generationStatus.set(user._id, {
              status: "error",
              progress: 0,
              error: error.message,
            });
          }
        });

        // Wait for current batch to complete before starting next batch
        await Promise.allSettled(batchPromises);

        // Add delay between batches to be gentle on the server
        if (batches.indexOf(batch) < batches.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }

      console.log(
        `🎉 Background QR code generation completed! Generated ${completedCount}/${totalCount} QR codes`
      );
    } catch (error) {
      console.error("❌ Background QR code generation failed:", error);
    } finally {
      this.isGenerating = false;
    }
  }

  /**
   * Generate QR code for a specific user
   */
  async generateForUser(user) {
    if (!user.shareId) {
      throw new Error("User has no shareId");
    }

    if (this.completedGenerations.has(user._id)) {
      console.log(`QR code already generated for ${user.name}`);
      return;
    }

    try {
      this.generationStatus.set(user._id, {
        status: "generating",
        progress: 0,
        error: null,
      });

      // Generate QR code data (client-side)
      const qrUrl = `${window.location.protocol}//${window.location.hostname}/share/${user.shareId}`;

      // Store the QR code data for later use
      this.generatedQRCodes.set(user._id, {
        qrData: qrUrl,
        shareId: user.shareId,
        size: 200,
        logoSize: 45,
        logoPath: "/logo.png",
        level: "H",
        bgColor: "#FFFFFF",
        fgColor: "#000000",
        timestamp: Date.now(),
      });

      this.completedGenerations.add(user._id);
      this.generationStatus.set(user._id, {
        status: "completed",
        progress: 100,
        error: null,
      });

      console.log(`✅ Generated QR code for ${user.name}`);
    } catch (error) {
      console.error(`❌ Failed to generate QR code for ${user.name}:`, error);
      this.generationStatus.set(user._id, {
        status: "error",
        progress: 0,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Get generation status for a user
   */
  getStatus(userId) {
    return (
      this.generationStatus.get(userId) || {
        status: "pending",
        progress: 0,
        error: null,
      }
    );
  }

  /**
   * Check if generation is in progress
   */
  isGenerationInProgress() {
    return this.isGenerating;
  }

  /**
   * Get overall generation progress
   */
  getOverallProgress() {
    const total = this.generationStatus.size;
    if (total === 0) return 0;

    const completed = Array.from(this.generationStatus.values()).filter(
      (status) => status.status === "completed"
    ).length;

    return Math.round((completed / total) * 100);
  }

  /**
   * Get generated QR code data for a user
   */
  getGeneratedQRCode(userId) {
    return this.generatedQRCodes.get(userId) || null;
  }

  /**
   * Check if QR code is generated for a user
   */
  isQRCodeGenerated(userId) {
    return this.generatedQRCodes.has(userId);
  }

  /**
   * Reset generation state
   */
  reset() {
    this.isGenerating = false;
    this.generationQueue.clear();
    this.completedGenerations.clear();
    this.generationStatus.clear();
    this.generatedQRCodes.clear();
  }
}

// Create singleton instance
const qrCodeBackgroundService = new QRCodeBackgroundService();

export default qrCodeBackgroundService;
