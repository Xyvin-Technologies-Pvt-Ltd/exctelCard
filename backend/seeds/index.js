const connectDB = require("../config/database");
const seedAdmin = require("./admin.seed");

const runSeeds = async () => {
  try {
    // Connect to database
    await connectDB();

    // Run seeds
    await seedAdmin();

    console.log("✅ All seeds completed successfully");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error running seeds:", error);
    process.exit(1);
  }
};

// Run seeds if this file is executed directly
if (require.main === module) {
  runSeeds();
}

module.exports = runSeeds;
