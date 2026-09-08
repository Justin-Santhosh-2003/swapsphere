require("dotenv").config();
const dns = require("dns");
dns.setServers(["1.1.1.1", "8.8.8.8"]);

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("../models/User");

async function setupAdmin() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected to MongoDB");

        // 1. Demote testUser1 back to regular USER
        const testUser1 = await User.findOneAndUpdate(
            { email: "testuser1@example.com" },
            { role: "USER" },
            { new: true }
        );
        if (testUser1) {
            console.log(`↩️  ${testUser1.fullName} demoted back to USER`);
        } else {
            console.log("⚠️  testUser1 not found — skipping demotion");
        }

        // 2. Create the dedicated admin account (or update if already exists)
        const adminEmail = "admin@swapsphere.com";
        const existing = await User.findOne({ email: adminEmail });

        if (existing) {
            // Update role and password if already exists
            existing.role = "ADMIN";
            existing.password = await bcrypt.hash("admin123", 10);
            await existing.save();
            console.log(`✅ Existing admin@swapsphere.com updated — role set to ADMIN`);
        } else {
            const hashedPassword = await bcrypt.hash("admin123", 10);
            const admin = await User.create({
                fullName: "Admin",
                email: adminEmail,
                password: hashedPassword,
                role: "ADMIN",
                status: "ACTIVE",
                location: "SwapSphere HQ"
            });
            console.log(`✅ Admin user created: ${admin.fullName} (${admin.email})`);
        }

        console.log("\n🔐 Admin Credentials:");
        console.log("   Email   : admin@swapsphere.com");
        console.log("   Password: admin123");
        console.log("   URL     : /admin\n");

        await mongoose.connection.close();
        process.exit(0);
    } catch (err) {
        console.error("❌ Error:", err);
        process.exit(1);
    }
}

setupAdmin();
