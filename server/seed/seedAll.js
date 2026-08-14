require("dotenv").config();

const dns = require("dns");
dns.setServers(["1.1.1.1", "8.8.8.8"]);

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const User = require("../models/User");
const Category = require("../models/Category");
const Item = require("../models/Item");
const ExchangeRequest = require("../models/ExchangeRequest");
const Review = require("../models/Review");

async function seedAll() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected to MongoDB");

        // 1. Clear database collections
        await Item.deleteMany({});
        await ExchangeRequest.deleteMany({});
        await Review.deleteMany({});
        await Category.deleteMany({});
        await User.deleteMany({ email: { $in: ["alex@swapsphere.com", "justin@swapsphere.com", "rahul@swapsphere.com", "admin@swapsphere.com"] } });

        console.log("🗑️ Cleared existing test data");

        // 2. Create Categories
        const categoriesData = [
            {
                name: "Electronics",
                icon: "💻",
                description: "Gadgets, laptops, cameras, smartphones, and accessories",
                subcategories: ["Camera", "Laptop", "Mobile", "Headphones", "Gaming"]
            },
            {
                name: "Books",
                icon: "📚",
                description: "Textbooks, fiction, non-fiction, and comics",
                subcategories: ["Academic", "Fiction", "Non Fiction", "Comics"]
            },
            {
                name: "Furniture",
                icon: "🛋️",
                description: "Chairs, tables, desks, sofas, and home decor",
                subcategories: ["Table", "Chair", "Sofa", "Bed", "Storage"]
            },
            {
                name: "Fashion",
                icon: "👕",
                description: "Clothing, shoes, jackets, and fashion accessories",
                subcategories: ["Men", "Women", "Shoes", "Accessories"]
            },
            {
                name: "Sports & Fitness",
                icon: "⚽",
                description: "Sports gear, gym equipment, and outdoor gear",
                subcategories: ["Cricket", "Football", "Cycling", "Gym"]
            },
            {
                name: "Musical Instruments",
                icon: "🎸",
                description: "Guitars, keyboards, drums, and music gear",
                subcategories: ["Guitar", "Keyboard", "Drums", "Audio"]
            }
        ];

        const createdCategories = await Category.insertMany(categoriesData);
        console.log(`✅ Seeded ${createdCategories.length} categories`);

        const catMap = {};
        createdCategories.forEach((c) => {
            catMap[c.name.toLowerCase()] = c._id;
        });

        // 3. Create Demo Users
        const hashedPassword = await bcrypt.hash("password123", 10);

        const usersData = [
            {
                fullName: "Alex Rivera",
                email: "alex@swapsphere.com",
                password: hashedPassword,
                location: "Kottayam, Kerala",
                bio: "Tech enthusiast and guitar player looking to trade quality gear.",
                profilePicture: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
                totalCompletedExchanges: 4,
                averageRating: 4.8,
                exchangeSuccessRate: 95
            },
            {
                fullName: "Justin Santhosh",
                email: "justin@swapsphere.com",
                password: hashedPassword,
                location: "Kochi, Kerala",
                bio: "Photography and gadget buff. Always open for smart swaps!",
                profilePicture: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
                totalCompletedExchanges: 6,
                averageRating: 4.9,
                exchangeSuccessRate: 98
            },
            {
                fullName: "Rahul Kumar",
                email: "rahul@swapsphere.com",
                password: hashedPassword,
                location: "Trivandrum, Kerala",
                bio: "Fitness fanatic & avid book reader.",
                profilePicture: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80",
                totalCompletedExchanges: 3,
                averageRating: 4.6,
                exchangeSuccessRate: 90
            },
            {
                fullName: "Admin User",
                email: "admin@swapsphere.com",
                password: hashedPassword,
                location: "SwapSphere HQ",
                role: "ADMIN",
                profilePicture: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80"
            }
        ];

        const [alex, justin, rahul, admin] = await User.insertMany(usersData);
        console.log(`✅ Seeded 4 demo users (password: password123)`);

        // 4. Create Items with real Cloudinary/Unsplash high quality images & exchange preferences
        const itemsData = [
            // Justin's Items
            {
                ownerId: justin._id,
                title: "Canon EOS 200D DSLR Camera",
                description: "Lightly used Canon 200D DSLR with 18-55mm lens. Crisp image quality, 24.2 MP sensor, built-in Wi-Fi. Comes with camera bag and 32GB SD card.",
                categoryId: catMap["electronics"],
                subcategory: "Camera",
                condition: "EXCELLENT",
                images: [
                    "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&auto=format&fit=crop&q=80"
                ],
                exchangePreferences: [
                    { categoryId: catMap["musical instruments"], subcategory: "Guitar", priority: 1 },
                    { categoryId: catMap["electronics"], subcategory: "Laptop", priority: 2 }
                ]
            },
            {
                ownerId: justin._id,
                title: "Sony WH-1000XM4 Noise Canceling Headphones",
                description: "Industry leading noise cancellation over-ear headphones in Midnight Blue. Excellent bass response and 30-hour battery life.",
                categoryId: catMap["electronics"],
                subcategory: "Headphones",
                condition: "LIKE_NEW",
                images: [
                    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80"
                ],
                exchangePreferences: [
                    { categoryId: catMap["electronics"], subcategory: "Mobile", priority: 1 }
                ]
            },
            {
                ownerId: justin._id,
                title: "Wooden Ergonomic Study Table",
                description: "Solid teak wood study desk with cable management grommet and two smooth storage drawers.",
                categoryId: catMap["furniture"],
                subcategory: "Table",
                condition: "GOOD",
                images: [
                    "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800&auto=format&fit=crop&q=80"
                ],
                exchangePreferences: [
                    { categoryId: catMap["furniture"], subcategory: "Chair", priority: 1 }
                ]
            },

            // Alex's Items
            {
                ownerId: alex._id,
                title: "Yamaha FG800 Acoustic Guitar",
                description: "Beautiful acoustic guitar with solid spruce top. Deep warm resonance, perfect for beginners and seasoned players alike.",
                categoryId: catMap["musical instruments"],
                subcategory: "Guitar",
                condition: "LIKE_NEW",
                images: [
                    "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800&auto=format&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1525201548942-d8732f6617a0?w=800&auto=format&fit=crop&q=80"
                ],
                exchangePreferences: [
                    { categoryId: catMap["electronics"], subcategory: "Camera", priority: 1 },
                    { categoryId: catMap["electronics"], subcategory: "Laptop", priority: 2 }
                ]
            },
            {
                ownerId: alex._id,
                title: "Apple MacBook Air M1 (256GB, Space Gray)",
                description: "M1 chip MacBook Air with 8GB RAM and 256GB SSD. Battery health at 92%. Super fast performance.",
                categoryId: catMap["electronics"],
                subcategory: "Laptop",
                condition: "EXCELLENT",
                images: [
                    "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&auto=format&fit=crop&q=80"
                ],
                exchangePreferences: [
                    { categoryId: catMap["electronics"], subcategory: "Camera", priority: 1 }
                ]
            },
            {
                ownerId: alex._id,
                title: "Genuine Vintage Leather Jacket",
                description: "Men's size M genuine brown leather jacket. Stylish motorcycle fit with soft inner lining.",
                categoryId: catMap["fashion"],
                subcategory: "Men",
                condition: "GOOD",
                images: [
                    "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&auto=format&fit=crop&q=80"
                ],
                exchangePreferences: [
                    { categoryId: catMap["fashion"], subcategory: "Shoes", priority: 1 }
                ]
            },

            // Rahul's Items
            {
                ownerId: rahul._id,
                title: "iPhone 13 128GB Midnight",
                description: "iPhone 13 in pristine condition. No scratches on front screen or back glass. Box and original Cable included.",
                categoryId: catMap["electronics"],
                subcategory: "Mobile",
                condition: "EXCELLENT",
                images: [
                    "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&auto=format&fit=crop&q=80"
                ],
                exchangePreferences: [
                    { categoryId: catMap["electronics"], subcategory: "Headphones", priority: 1 }
                ]
            },
            {
                ownerId: rahul._id,
                title: "Clean Code & Pragmatic Programmer Book Set",
                description: "Two must-read software engineering books by Robert C. Martin and Andrew Hunt. Great condition.",
                categoryId: catMap["books"],
                subcategory: "Academic",
                condition: "LIKE_NEW",
                images: [
                    "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80"
                ],
                exchangePreferences: [
                    { categoryId: catMap["books"], subcategory: "Non Fiction", priority: 1 }
                ]
            },
            {
                ownerId: rahul._id,
                title: "Trek Mountain Bike (21 Speed)",
                description: "Lightweight aluminum frame mountain bicycle with front suspension and Shimano 21-speed gear system.",
                categoryId: catMap["sports & fitness"],
                subcategory: "Cycling",
                condition: "GOOD",
                images: [
                    "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800&auto=format&fit=crop&q=80"
                ],
                exchangePreferences: [
                    { categoryId: catMap["sports & fitness"], subcategory: "Gym", priority: 1 }
                ]
            }
        ];

        const createdItems = await Item.insertMany(itemsData);
        console.log(`✅ Seeded ${createdItems.length} items with images & exchange preferences`);

        // 5. Create Sample Exchange Requests
        const sampleRequest = await ExchangeRequest.create({
            requesterId: alex._id,
            receiverId: justin._id,
            offeredItemId: createdItems.find(i => i.title.includes("Yamaha"))._id,
            requestedItemId: createdItems.find(i => i.title.includes("Canon"))._id,
            status: "PENDING",
            note: "Hey Justin! I saw your Canon DSLR. Would love to swap my Yamaha Acoustic Guitar for it!"
        });

        const completedRequest = await ExchangeRequest.create({
            requesterId: rahul._id,
            receiverId: alex._id,
            offeredItemId: createdItems.find(i => i.title.includes("iPhone"))._id,
            requestedItemId: createdItems.find(i => i.title.includes("MacBook"))._id,
            status: "ACCEPTED",
            note: "Let me know if you are interested in the iPhone 13 for your MacBook Air."
        });

        console.log("✅ Seeded sample exchange requests (1 Pending, 1 Accepted)");

        // 6. Create Sample Reviews
        await Review.create({
            exchangeRequestId: completedRequest._id,
            reviewerId: rahul._id,
            revieweeId: alex._id,
            rating: 5,
            comment: "Smooth exchange! Alex was punctual and the MacBook Air was exactly as described."
        });

        console.log("✅ Seeded sample review");

        console.log("\n==========================================");
        console.log("🎉 SWAPSPHERE DATABASE SEEDED SUCCESSFULLY!");
        console.log("==========================================");
        console.log("Demo Accounts (Password: password123):");
        console.log("1. Alex Rivera   : alex@swapsphere.com");
        console.log("2. Justin        : justin@swapsphere.com");
        console.log("3. Rahul Kumar   : rahul@swapsphere.com");
        console.log("4. Admin User    : admin@swapsphere.com");
        console.log("==========================================\n");

        process.exit(0);
    } catch (error) {
        console.error("❌ Seeding failed:", error);
        process.exit(1);
    }
}

seedAll();
