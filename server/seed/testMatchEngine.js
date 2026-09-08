require("dotenv").config();
const dns = require("dns");
dns.setServers(["1.1.1.1", "8.8.8.8"]);

const mongoose = require("mongoose");
const User = require("../models/User");
const Category = require("../models/Category");
const Item = require("../models/Item");
const { findMatchesForUser } = require("../utils/matchingEngine");

async function testMatches() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected to MongoDB");

        const users = await User.find().limit(5);
        for (const u of users) {
            const matches = await findMatchesForUser(u._id);
            console.log(`\n👤 User: ${u.fullName} (${u.email})`);
            console.log(`   2-Way Direct Matches: ${matches.directMatches.length}`);
            console.log(`   3-Way Ring Matches:   ${matches.threeWayMatches.length}`);
            if (matches.directMatches.length > 0) {
                console.log(`   Sample 2-Way: [${matches.directMatches[0].myItem.title}] ↔ [${matches.directMatches[0].otherItem.title}]`);
            }
            if (matches.threeWayMatches.length > 0) {
                console.log(`   Sample 3-Way: [${matches.threeWayMatches[0].itemA.title}] → [${matches.threeWayMatches[0].itemB.title}] → [${matches.threeWayMatches[0].itemC.title}]`);
            }
        }
        await mongoose.connection.close();
        process.exit(0);
    } catch (err) {
        console.error("Test error:", err);
        process.exit(1);
    }
}

testMatches();
