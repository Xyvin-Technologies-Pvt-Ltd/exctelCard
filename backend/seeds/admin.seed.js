const bcrypt = require("bcryptjs");
const User = require("../modules/users/user.model");

const seedAdmin = async () => {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: "admin@exctel.com" });

    if (existingAdmin) {
      console.log("✅ Admin user already exists");
      return;
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash("admin123", 10);

    const adminUser = new User({
      email: "admin@exctel.com",
      password: hashedPassword,
      name: "Super Administrator",
      role: "admin",
      tenantId: "admin",
      loginType: "password",
      isActive: true,
      lastLogin: new Date(),
      metadata: {
        isSuperAdmin: true,
        createdBy: "system",
      },
      createdBy:"admin"
    });

    await adminUser.save();
    console.log("✅ Admin user created successfully");
  } catch (error) {
    console.error("❌ Error seeding admin user:", error);
    throw error;
  }
};

module.exports = seedAdmin;
