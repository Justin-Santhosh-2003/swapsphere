require("dotenv").config();
const dns = require("dns");
dns.setServers(["1.1.1.1", "8.8.8.8"]);

const mongoose = require("mongoose");
const User = require("../models/User");
const Item = require("../models/Item");
const Category = require("../models/Category");
const ExchangeRequest = require("../models/ExchangeRequest");
const ExchangeRoom = require("../models/ExchangeRoom");
const Review = require("../models/Review");
const Message = require("../models/Message");


const DEFAULT_CATEGORIES = [
    {
        name: "Electronics",
        icon: "💻",
        description: "Gadgets, laptops, smartphones, audio gear, and accessories",
        subcategories: ["Laptops & Computers", "Smartphones & Tablets", "Audio & Headphones", "Cameras & Photography", "Gaming Consoles", "Wearables & Smartwatches"]
    },
    {
        name: "Books & Media",
        icon: "📚",
        description: "Textbooks, novels, comics, vinyls, and educational materials",
        subcategories: ["Textbooks & Academics", "Fiction & Novels", "Comics & Graphic Novels", "Self-Help & Non-Fiction", "Vinyl Records & CDs"]
    },
    {
        name: "Fashion & Apparel",
        icon: "👕",
        description: "Men's and women's clothing, footwear, watches, and accessories",
        subcategories: ["Men's Clothing", "Women's Clothing", "Footwear & Sneakers", "Watches & Accessories", "Bags & Backpacks"]
    },
    {
        name: "Sports & Fitness",
        icon: "⚽",
        description: "Gym equipment, bicycles, sports gear, and outdoor activity items",
        subcategories: ["Cycling & Bicycles", "Fitness & Gym Equipment", "Outdoor & Camping", "Cricket & Ball Sports", "Racket Sports"]
    },
    {
        name: "Home & Living",
        icon: "🏡",
        description: "Furniture, kitchenware, decor, and household items",
        subcategories: ["Kitchen Appliances", "Furniture & Decor", "Lighting & Lamps", "Bedding & Linens", "Home Gardening"]
    },
    {
        name: "Toys & Hobbies",
        icon: "🎮",
        description: "Board games, collectibles, musical instruments, and DIY craft items",
        subcategories: ["Board Games & Puzzles", "Action Figures & Collectibles", "Musical Instruments", "Crafts & Hobby Kits"]
    },
    {
        name: "Vehicles & Mobility",
        icon: "🚲",
        description: "Scooters, electric bikes, helmets, and vehicle accessories",
        subcategories: ["Electric Scooters & E-Bikes", "Helmets & Safety Gear", "Vehicle Accessories", "Skateboards & Rollers"]
    }
];

async function wipeAllData() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected to MongoDB");

        console.log("🗑️  Wiping all existing database collections...");
        await Promise.all([
            User.deleteMany({}),
            Item.deleteMany({}),
            Category.deleteMany({}),
            ExchangeRequest.deleteMany({}),
            ExchangeRoom.deleteMany({}),
            Review.deleteMany({}),
            Message.deleteMany({})

        ]);
        console.log("✨ All seed data wiped clean!");

        console.log("📂 Seeding default categories...");
        await Category.insertMany(DEFAULT_CATEGORIES);
        console.log("✅ 7 Default Categories created successfully.");

        console.log("\n════════════════════════════════════════════════════════════════════");
        console.log("🎉 DATABASE CLEAN WIPE COMPLETE!");
        console.log("════════════════════════════════════════════════════════════════════");
        console.log("You can now manually register new users and post listings cleanly.");
        console.log("════════════════════════════════════════════════════════════════════\n");

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error("❌ Error wiping database:", error);
        process.exit(1);
    }
}

wipeAllData();
