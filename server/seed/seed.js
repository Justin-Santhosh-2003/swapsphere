/**
 * SwapSphere — 70 Listings Master Seed Script (5 Accounts)
 * =========================================================
 * Run: node seed/seed.js
 *
 * Password for all 5 users: pass123
 */

require("dotenv").config({ path: require("path").join(__dirname, "../.env") });

const dns = require("dns");
dns.setServers(["1.1.1.1", "8.8.8.8"]);

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const User = require("../models/User");
const Category = require("../models/Category");
const Item = require("../models/Item");
const ExchangeRequest = require("../models/ExchangeRequest");
const ExchangeRoom = require("../models/ExchangeRoom");
const Message = require("../models/Message");
const Review = require("../models/Review");

async function seed70() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected to MongoDB");

        // ── 0. WIPE ALL SEED DATA ────────────────────────────────────
        await Promise.all([
            Item.deleteMany({}),
            ExchangeRequest.deleteMany({}),
            ExchangeRoom.deleteMany({}),
            Message.deleteMany({}),
            Review.deleteMany({}),
            Category.deleteMany({}),
            User.deleteMany({})
        ]);
        console.log("🗑️  Wiped all existing database collections\n");

        // ── 1. CREATE CATEGORIES ────────────────────────────────────
        const categoriesData = [
            {
                name: "Electronics & Tech",
                icon: "💻",
                description: "Laptops, smartphones, cameras, headphones, tablets, and smart devices",
                subcategories: [
                    "Laptop", "MacBook", "Smartphone", "Tablet", "iPad", "DSLR Camera",
                    "Mirrorless Camera", "Camera Lens", "Headphones", "Wireless Earbuds",
                    "Bluetooth Speaker", "Monitor", "Desktop PC", "Smartwatch", "Power Bank",
                    "Microphone", "Drone", "Action Camera"
                ]
            },
            {
                name: "Musical Instruments",
                icon: "🎸",
                description: "Guitars, keyboards, drums, violins, studio audio, amplifiers, pedals",
                subcategories: [
                    "Acoustic Guitar", "Electric Guitar", "Bass Guitar", "Ukulele",
                    "Digital Piano", "Keyboard Synthesizer", "MIDI Controller",
                    "Electronic Drum Kit", "Acoustic Drum Kit", "Violin", "Studio Microphone",
                    "Guitar Amplifier", "Effects Pedal"
                ]
            },
            {
                name: "Sports & Fitness",
                icon: "⚽",
                description: "Gym equipment, cycles, cricket gear, badminton, yoga, camping",
                subcategories: [
                    "Dumbbell Set", "Yoga Mat", "Cricket Kit", "Badminton Racquet",
                    "Cycling Gear", "Football", "Basketball", "Tennis Racquet", "Gym Gloves",
                    "Resistance Bands", "Skipping Rope", "Boxing Gloves", "Treadmill"
                ]
            },
            {
                name: "Gaming",
                icon: "🎮",
                description: "Consoles, controllers, VR headsets, gaming chairs, game titles",
                subcategories: [
                    "PlayStation", "Xbox", "Nintendo Switch", "PC Gaming", "VR Headset",
                    "Gaming Chair", "Gaming Headset", "Controllers", "Game Titles"
                ]
            },
            {
                name: "Books & Education",
                icon: "📚",
                description: "Programming textbooks, novels, engineering books, exam prep",
                subcategories: [
                    "Programming", "Engineering", "Fiction", "Non-Fiction", "Self-Help",
                    "Science", "History", "Comics", "Exam Prep", "Language Learning"
                ]
            },
            {
                name: "Fashion & Accessories",
                icon: "🕶️",
                description: "Watches, sunglasses, leather jackets, backpacks, sneakers",
                subcategories: [
                    "Analog Watch", "Sunglasses", "Leather Jacket", "Backpack",
                    "Sneakers", "Handbag", "Wallets"
                ]
            },
            {
                name: "Home & Appliances",
                icon: "🏠",
                description: "Coffee makers, air purifiers, desk lamps, blenders, home decor",
                subcategories: [
                    "Coffee Machine", "Air Purifier", "Desk Lamp", "Blender", "Air Fryer",
                    "Vacuum Cleaner", "Microwave"
                ]
            }
        ];

        const createdCategories = await Category.insertMany(categoriesData);
        console.log(`📂 Created ${createdCategories.length} Categories`);

        const catMap = {};
        createdCategories.forEach(c => { catMap[c.name] = c; });

        // ── 2. CREATE 5 USER ACCOUNTS (password: pass123) ────────────
        const hash = await bcrypt.hash("pass123", 10);

        const usersData = [
            {
                fullName: "Alex Johnson",
                email: "alex@swapsphere.com",
                password: hash,
                location: "Mumbai",
                phone: "9876543210",
                bio: "Tech gear enthusiast & musician. Swapping laptops, drones, audio gear and instruments!",
                averageRating: 4.8,
                totalCompletedExchanges: 4,
                exchangeSuccessRate: 100,
                status: "ACTIVE"
            },
            {
                fullName: "Vikram Sharma",
                email: "vikram@swapsphere.com",
                password: hash,
                location: "Delhi",
                phone: "9876543211",
                bio: "Outdoor sports lover & photographer. Bartering camera lenses, mountain bikes & fitness kit.",
                averageRating: 4.7,
                totalCompletedExchanges: 3,
                exchangeSuccessRate: 100,
                status: "ACTIVE"
            },
            {
                fullName: "Rahul Verma",
                email: "rahul@swapsphere.com",
                password: hash,
                location: "Bangalore",
                phone: "9876543212",
                bio: "Full-stack developer & hardcore gamer. Trading PC parts, consoles, mechanical keyboards.",
                averageRating: 4.9,
                totalCompletedExchanges: 5,
                exchangeSuccessRate: 100,
                status: "ACTIVE"
            },
            {
                fullName: "Priya Nair",
                email: "priya@swapsphere.com",
                password: hash,
                location: "Chennai",
                phone: "9876543213",
                bio: "Book collector & acoustic music performer. Love trading instruments and rare books.",
                averageRating: 4.8,
                totalCompletedExchanges: 3,
                exchangeSuccessRate: 100,
                status: "ACTIVE"
            },
            {
                fullName: "Ananya Patel",
                email: "ananya@swapsphere.com",
                password: hash,
                location: "Pune",
                phone: "9876543214",
                bio: "Fitness coach & smart home lifestyle blogger. Swapping home tech & sportswear.",
                averageRating: 5.0,
                totalCompletedExchanges: 4,
                exchangeSuccessRate: 100,
                status: "ACTIVE"
            }
        ];

        const [alex, vikram, rahul, priya, ananya] = await User.insertMany(usersData);
        console.log(`👤 Created 5 Test Users (password: pass123 for all)`);

        // ── 3. CREATE 70 REALISTIC ITEMS (14 items per user) ─────────
        const rawItems = [
            // ================= ALEX (14 items) =================
            {
                ownerId: alex._id, title: "Apple MacBook Air M2 (8GB / 256GB)",
                description: "MacBook Air M2 Space Grey. Battery health 96%. Includes original MagSafe charger.",
                categoryName: "Electronics & Tech", subcategory: "MacBook", condition: "EXCELLENT",
                images: ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600"],
                prefCat: "Musical Instruments", prefSub: "Acoustic Guitar"
            },
            {
                ownerId: alex._id, title: "DJI Mini 3 Pro Drone with Fly More Combo",
                description: "4K 60fps camera drone, under 249g. Comes with RC controller screen and 3 batteries.",
                categoryName: "Electronics & Tech", subcategory: "Drone", condition: "LIKE_NEW",
                images: ["https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=600"],
                prefCat: "Electronics & Tech", prefSub: "DSLR Camera"
            },
            {
                ownerId: alex._id, title: "Sony WH-1000XM5 Noise Cancelling Headphones",
                description: "Industry leading noise cancellation. Silver colour with carrying case and audio cable.",
                categoryName: "Electronics & Tech", subcategory: "Headphones", condition: "LIKE_NEW",
                images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600"],
                prefCat: "Gaming", prefSub: "PlayStation"
            },
            {
                ownerId: alex._id, title: "iPad Pro 11-inch M1 (128GB WiFi)",
                description: "Space Grey iPad Pro with M1 chip. Includes Apple Pencil 2nd Gen and Smart Folio case.",
                categoryName: "Electronics & Tech", subcategory: "iPad", condition: "EXCELLENT",
                images: ["https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600"],
                prefCat: "Musical Instruments", prefSub: "Digital Piano"
            },
            {
                ownerId: alex._id, title: "Arturia MiniLab 3 MIDI Controller Keyboard",
                description: "25-key USB MIDI keyboard controller. Creative pads and touch strips. Perfect condition.",
                categoryName: "Musical Instruments", subcategory: "MIDI Controller", condition: "LIKE_NEW",
                images: ["https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?w=600"],
                prefCat: "Electronics & Tech", prefSub: "Wireless Earbuds"
            },
            {
                ownerId: alex._id, title: "LG Ultragear 27-inch 4K Gaming Monitor (144Hz)",
                description: "IPS 1ms G-SYNC compatible display. HDMI 2.1 support for PS5 and PC gaming.",
                categoryName: "Electronics & Tech", subcategory: "Monitor", condition: "GOOD",
                images: ["https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600"],
                prefCat: "Sports & Fitness", prefSub: "Cycling Gear"
            },
            {
                ownerId: alex._id, title: "Shure SM7B Dynamic Vocal Studio Microphone",
                description: "Legendary podcast and vocal studio mic. Comes with Cloudlifter CL-1 inline preamp.",
                categoryName: "Musical Instruments", subcategory: "Studio Microphone", condition: "EXCELLENT",
                images: ["https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=600"],
                prefCat: "Electronics & Tech", prefSub: "Smartphone"
            },
            {
                ownerId: alex._id, title: "Samsung Galaxy Watch 5 Pro (45mm LTE)",
                description: "Titanium case with Sapphire crystal. GPS route tracking and 3-day battery backup.",
                categoryName: "Electronics & Tech", subcategory: "Smartwatch", condition: "GOOD",
                images: ["https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600"],
                prefCat: "Sports & Fitness", prefSub: "Dumbbell Set"
            },
            {
                ownerId: alex._id, title: "Anker PowerCore 24,000mAh Power Bank (140W)",
                description: "Ultra-fast laptop charging power bank. Smart digital display shows power input/output.",
                categoryName: "Electronics & Tech", subcategory: "Power Bank", condition: "LIKE_NEW",
                images: ["https://images.unsplash.com/photo-1609592424009-32219b139943?w=600"],
                prefCat: "Books & Education", prefSub: "Programming"
            },
            {
                ownerId: alex._id, title: "Marshall Stanmore II Bluetooth Speaker",
                description: "Iconic vintage style home speaker with powerful bass and crisp treble. Black finish.",
                categoryName: "Electronics & Tech", subcategory: "Bluetooth Speaker", condition: "EXCELLENT",
                images: ["https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600"],
                prefCat: "Fashion & Accessories", prefSub: "Leather Jacket"
            },
            {
                ownerId: alex._id, title: "Google Pixel 7 Pro (128GB Hazel)",
                description: "Triple rear camera setup with 30x Super Res Zoom. Clean Android 14 installation.",
                categoryName: "Electronics & Tech", subcategory: "Smartphone", condition: "EXCELLENT",
                images: ["https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600"],
                prefCat: "Gaming", prefSub: "Nintendo Switch"
            },
            {
                ownerId: alex._id, title: "Bose QuietComfort 45 Headphones (Black)",
                description: "World-class noise cancellation, Aware Mode, and 24-hour battery life.",
                categoryName: "Electronics & Tech", subcategory: "Headphones", condition: "LIKE_NEW",
                images: ["https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600"],
                prefCat: "Sports & Fitness", prefSub: "Treadmill"
            },
            {
                ownerId: alex._id, title: "Universal Audio Volt 2 Studio Audio Interface",
                description: "2-in/2-out USB 2.0 audio interface with Vintage Mic Preamp mode for music producers.",
                categoryName: "Musical Instruments", subcategory: "MIDI Controller", condition: "LIKE_NEW",
                images: ["https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600"],
                prefCat: "Electronics & Tech", prefSub: "Action Camera"
            },
            {
                ownerId: alex._id, title: "Insta360 X3 360-Degree Action Camera",
                description: "Dual 1/2-inch sensors for 5.7K 360 video recording with Invisible Selfie Stick.",
                categoryName: "Electronics & Tech", subcategory: "Action Camera", condition: "EXCELLENT",
                images: ["https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600"],
                prefCat: "Electronics & Tech", prefSub: "Power Bank"
            },

            // ================= VIKRAM (14 items) =================
            {
                ownerId: vikram._id, title: "Fender CD-60S Solid Top Acoustic Guitar",
                description: "Mahogany back & sides with solid spruce top. Warm resonant tone. Padded bag included.",
                categoryName: "Musical Instruments", subcategory: "Acoustic Guitar", condition: "EXCELLENT",
                images: ["https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=600"],
                prefCat: "Electronics & Tech", prefSub: "MacBook"
            },
            {
                ownerId: vikram._id, title: "Canon EOS R6 Mirrorless Camera (Body Only)",
                description: "20MP full-frame 4K 60p video, 20fps shooting, in-body stabilization. Shutter count 12k.",
                categoryName: "Electronics & Tech", subcategory: "Mirrorless Camera", condition: "EXCELLENT",
                images: ["https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600"],
                prefCat: "Electronics & Tech", prefSub: "Drone"
            },
            {
                ownerId: vikram._id, title: "Trek Marlin 7 Mountain Bicycle (Medium Frame)",
                description: "RockShox suspension fork, Shimano Deore 1x10 drivetrain, hydraulic disc brakes.",
                categoryName: "Sports & Fitness", subcategory: "Cycling Gear", condition: "GOOD",
                images: ["https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=600"],
                prefCat: "Electronics & Tech", prefSub: "Monitor"
            },
            {
                ownerId: vikram._id, title: "Bowflex SelectTech 552 Adjustable Dumbbells",
                description: "Adjusts from 2.5kg to 24kg per dumbbell. Saves space, replaces 15 sets of weights.",
                categoryName: "Sports & Fitness", subcategory: "Dumbbell Set", condition: "LIKE_NEW",
                images: ["https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=600"],
                prefCat: "Electronics & Tech", prefSub: "Smartwatch"
            },
            {
                ownerId: vikram._id, title: "GoPro HERO 11 Black Action Camera",
                description: "5.3K 60fps video, HyperSmooth 5.0 video stabilization. Waterproof up to 33ft.",
                categoryName: "Electronics & Tech", subcategory: "Action Camera", condition: "EXCELLENT",
                images: ["https://images.unsplash.com/photo-1564466809058-bf81182fe9e9?w=600"],
                prefCat: "Gaming", prefSub: "VR Headset"
            },
            {
                ownerId: vikram._id, title: "Sigma 24-70mm f/2.8 DG DN Art Lens for Sony E",
                description: "Fast standard zoom lens for Sony full frame. Sharp optics and smooth bokeh.",
                categoryName: "Electronics & Tech", subcategory: "Camera Lens", condition: "LIKE_NEW",
                images: ["https://images.unsplash.com/photo-1617005082133-548c4dd27f35?w=600"],
                prefCat: "Electronics & Tech", prefSub: "Headphones"
            },
            {
                ownerId: vikram._id, title: "Wilson Pro Staff v14 Tennis Racquet",
                description: "315g unstrung weight, 16x19 string pattern. Superior control and feel.",
                categoryName: "Sports & Fitness", subcategory: "Tennis Racquet", condition: "GOOD",
                images: ["https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=600"],
                prefCat: "Sports & Fitness", prefSub: "Badminton Racquet"
            },
            {
                ownerId: vikram._id, title: "Kookaburra Kahuna Pro Cricket Bat (Grade 1)",
                description: "Short handle English Willow bat. Exceptional balance and ping. Lightly used.",
                categoryName: "Sports & Fitness", subcategory: "Cricket Kit", condition: "GOOD",
                images: ["https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=600"],
                prefCat: "Musical Instruments", prefSub: "Electric Guitar"
            },
            {
                ownerId: vikram._id, title: "Manduka PRO Yoga Mat (6mm Thickness)",
                description: "High-density cushion yoga mat in Sage Green. Lifetime guaranteed comfort.",
                categoryName: "Sports & Fitness", subcategory: "Yoga Mat", condition: "LIKE_NEW",
                images: ["https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600"],
                prefCat: "Home & Appliances", prefSub: "Coffee Machine"
            },
            {
                ownerId: vikram._id, title: "Everlast Pro Style Boxing Gloves (14oz)",
                description: "Synthetic leather gloves with wrist wrap strap. Includes hand wraps and mesh bag.",
                categoryName: "Sports & Fitness", subcategory: "Boxing Gloves", condition: "EXCELLENT",
                images: ["https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=600"],
                prefCat: "Sports & Fitness", prefSub: "Gym Gloves"
            },
            {
                ownerId: vikram._id, title: "Nikon Z6 II Mirrorless Camera with 24-70mm Lens",
                description: "Dual EXPEED 6 processors, 4K UHD video, 273-point Hybrid AF system.",
                categoryName: "Electronics & Tech", subcategory: "Mirrorless Camera", condition: "EXCELLENT",
                images: ["https://images.unsplash.com/photo-1512790182412-b19e6d62bc39?w=600"],
                prefCat: "Electronics & Tech", prefSub: "Drone"
            },
            {
                ownerId: vikram._id, title: "Garmin Forerunner 955 Solar GPS Watch",
                description: "Solar charging triathlon watch with full color maps and training readiness metrics.",
                categoryName: "Electronics & Tech", subcategory: "Smartwatch", condition: "LIKE_NEW",
                images: ["https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=600"],
                prefCat: "Sports & Fitness", prefSub: "Cycling Gear"
            },
            {
                ownerId: vikram._id, title: "Decathlon 4-Person Camping Tent (Waterproof)",
                description: "Fresh & Black technology tent. Blocks 99% light inside even during direct sunshine.",
                categoryName: "Sports & Fitness", subcategory: "Cycling Gear", condition: "GOOD",
                images: ["https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600"],
                prefCat: "Sports & Fitness", prefSub: "Dumbbell Set"
            },
            {
                ownerId: vikram._id, title: "Peak Design Everyday Backpack 20L v2",
                description: "Versatile camera and laptop backpack with MagLatch hardware and FlexFold dividers.",
                categoryName: "Fashion & Accessories", subcategory: "Backpack", condition: "EXCELLENT",
                images: ["https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=600"],
                prefCat: "Fashion & Accessories", prefSub: "Sunglasses"
            },

            // ================= RAHUL (14 items) =================
            {
                ownerId: rahul._id, title: "Sony PlayStation 5 Console (Disc Edition)",
                description: "PS5 disc console with DualSense controller, HD camera, and 3 games (GOW, Spider-Man 2).",
                categoryName: "Gaming", subcategory: "PlayStation", condition: "EXCELLENT",
                images: ["https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=600"],
                prefCat: "Electronics & Tech", prefSub: "Headphones"
            },
            {
                ownerId: rahul._id, title: "Meta Quest 2 VR Headset (256GB)",
                description: "All-in-one VR headset with Touch controllers and upgraded Elite Strap.",
                categoryName: "Gaming", subcategory: "VR Headset", condition: "LIKE_NEW",
                images: ["https://images.unsplash.com/photo-1622979135225-d2ba269bc1bd?w=600"],
                prefCat: "Electronics & Tech", prefSub: "Action Camera"
            },
            {
                ownerId: rahul._id, title: "Secretlab TITAN EVO 2022 Gaming Chair",
                description: "Ergonomic gaming chair in SoftWeave Fabric (Cookies & Cream colorway). 4D armrests.",
                categoryName: "Gaming", subcategory: "Gaming Chair", condition: "EXCELLENT",
                images: ["https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=600"],
                prefCat: "Electronics & Tech", prefSub: "Monitor"
            },
            {
                ownerId: rahul._id, title: "Nintendo Switch OLED Model (White)",
                description: "Vibrant 7-inch OLED screen. Comes with Pro Controller, Carrying Case, and Zelda TOTK.",
                categoryName: "Gaming", subcategory: "Nintendo Switch", condition: "LIKE_NEW",
                images: ["https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=600"],
                prefCat: "Musical Instruments", prefSub: "Ukulele"
            },
            {
                ownerId: rahul._id, title: "Custom Gaming PC (RTX 3080 / i7-12700K)",
                description: "High-end gaming desktop: 32GB DDR4 RAM, 1TB NVMe SSD, Corsair 850W PSU, Lian Li Mesh case.",
                categoryName: "Gaming", subcategory: "PC Gaming", condition: "EXCELLENT",
                images: ["https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600"],
                prefCat: "Electronics & Tech", prefSub: "MacBook"
            },
            {
                ownerId: rahul._id, title: "SteelSeries Arctis Nova Pro Wireless Headset",
                description: "Multi-system wireless gaming headset with active noise cancellation and hot-swappable batteries.",
                categoryName: "Gaming", subcategory: "Gaming Headset", condition: "LIKE_NEW",
                images: ["https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600"],
                prefCat: "Electronics & Tech", prefSub: "Wireless Earbuds"
            },
            {
                ownerId: rahul._id, title: "Xbox Series X Console (1TB SSD)",
                description: "4K gaming console with 12 Teraflops processing power. Comes with 2 Wireless Controllers.",
                categoryName: "Gaming", subcategory: "Xbox", condition: "EXCELLENT",
                images: ["https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=600"],
                prefCat: "Gaming", prefSub: "PlayStation"
            },
            {
                ownerId: rahul._id, title: "Keychron Q1 Custom Mechanical Keyboard",
                description: "Full aluminum body 75% gasket mount keyboard with Gateron Oil King switches & PBT keycaps.",
                categoryName: "Electronics & Tech", subcategory: "Desktop PC", condition: "LIKE_NEW",
                images: ["https://images.unsplash.com/photo-1595225476474-87563907a212?w=600"],
                prefCat: "Books & Education", prefSub: "Programming"
            },
            {
                ownerId: rahul._id, title: "Logitech G Pro X Superlight Wireless Gaming Mouse",
                description: "Ultra-lightweight under 63 grams wireless esports mouse with HERO 25K sensor.",
                categoryName: "Gaming", subcategory: "Controllers", condition: "GOOD",
                images: ["https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600"],
                prefCat: "Sports & Fitness", prefSub: "Gym Gloves"
            },
            {
                ownerId: rahul._id, title: "Elgato Stream Deck MK.2 (15 LCD Keys)",
                description: "Tactile stream controller for OBS, Twitch, Spotify, and smart studio shortcuts.",
                categoryName: "Electronics & Tech", subcategory: "Microphone", condition: "EXCELLENT",
                images: ["https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=600"],
                prefCat: "Fashion & Accessories", prefSub: "Analog Watch"
            },
            {
                ownerId: rahul._id, title: "ASUS ROG Swift 32-inch 4K OLED Gaming Monitor",
                description: "240Hz refresh rate OLED panel with 0.03ms response time and custom heatsink.",
                categoryName: "Electronics & Tech", subcategory: "Monitor", condition: "LIKE_NEW",
                images: ["https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600"],
                prefCat: "Gaming", prefSub: "PC Gaming"
            },
            {
                ownerId: rahul._id, title: "Steam Deck OLED (512GB Handheld Console)",
                description: "HDR OLED screen, 90Hz refresh rate, faster WiFi 6E, improved battery life.",
                categoryName: "Gaming", subcategory: "Nintendo Switch", condition: "EXCELLENT",
                images: ["https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600"],
                prefCat: "Electronics & Tech", prefSub: "iPad"
            },
            {
                ownerId: rahul._id, title: "Razer Huntsman V3 Pro Analog Gaming Keyboard",
                description: "Gen-2 analog optical switches with Rapid Trigger mode and adjustable actuation.",
                categoryName: "Gaming", subcategory: "Controllers", condition: "LIKE_NEW",
                images: ["https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600"],
                prefCat: "Gaming", prefSub: "Gaming Headset"
            },
            {
                ownerId: rahul._id, title: "Corsair Virtuoso RGB Wireless SE Gaming Headset",
                description: "High-fidelity 24-bit/96kHz audio with broadcast-grade omnidirectional microphone.",
                categoryName: "Gaming", subcategory: "Gaming Headset", condition: "GOOD",
                images: ["https://images.unsplash.com/photo-1599669454699-248893623440?w=600"],
                prefCat: "Electronics & Tech", prefSub: "Headphones"
            },

            // ================= PRIYA (14 items) =================
            {
                ownerId: priya._id, title: "Yamaha P-125 88-Key Weighted Digital Piano",
                description: "GHS weighted action keys with Pure CF sound engine. Includes stand, sustain pedal & bench.",
                categoryName: "Musical Instruments", subcategory: "Digital Piano", condition: "EXCELLENT",
                images: ["https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=600"],
                prefCat: "Electronics & Tech", prefSub: "iPad"
            },
            {
                ownerId: priya._id, title: "Ibanez SR300E Electric Bass Guitar (Pearl Black)",
                description: "4-string active bass guitar with PowerSpan Dual Coil pickups and 3-band EQ.",
                categoryName: "Musical Instruments", subcategory: "Bass Guitar", condition: "GOOD",
                images: ["https://images.unsplash.com/photo-1564186763535-ebb21ef5277f?w=600"],
                prefCat: "Sports & Fitness", prefSub: "Cricket Kit"
            },
            {
                ownerId: priya._id, title: "Kala KA-15S Satin Mahogany Soprano Ukulele",
                description: "Traditional mahogany soprano ukulele with Aquila Super Nylgut strings and padded gig bag.",
                categoryName: "Musical Instruments", subcategory: "Ukulele", condition: "LIKE_NEW",
                images: ["https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600"],
                prefCat: "Gaming", prefSub: "Nintendo Switch"
            },
            {
                ownerId: priya._id, title: "Design Patterns — Erich Gamma (Gang of Four)",
                description: "Hardcover classic reference book on reusable object-oriented software design patterns.",
                categoryName: "Books & Education", subcategory: "Programming", condition: "EXCELLENT",
                images: ["https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600"],
                prefCat: "Books & Education", prefSub: "Science"
            },
            {
                ownerId: priya._id, title: "Sony WF-1000XM4 Wireless Noise Cancelling Earbuds",
                description: "LDAC audio support, IPX4 water resistance, wireless charging case included.",
                categoryName: "Electronics & Tech", subcategory: "Wireless Earbuds", condition: "EXCELLENT",
                images: ["https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600"],
                prefCat: "Musical Instruments", prefSub: "MIDI Controller"
            },
            {
                ownerId: priya._id, title: "Roland TD-1DMK V-Drums Electronic Drum Kit",
                description: "Dual-mesh head electronic drum set with 15 preset drum kits and built-in coach functions.",
                categoryName: "Musical Instruments", subcategory: "Electronic Drum Kit", condition: "EXCELLENT",
                images: ["https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?w=600"],
                prefCat: "Electronics & Tech", prefSub: "Monitor"
            },
            {
                ownerId: priya._id, title: "Boss Katana-50 MkII Guitar Combo Amplifier",
                description: "50-watt 1x12 combo amp with 5 unique amp characters and 60 customizable Boss effects.",
                categoryName: "Musical Instruments", subcategory: "Guitar Amplifier", condition: "LIKE_NEW",
                images: ["https://images.unsplash.com/photo-1563330232-57114bb0823c?w=600"],
                prefCat: "Musical Instruments", prefSub: "Acoustic Guitar"
            },
            {
                ownerId: priya._id, title: "Sennheiser HD 560S Open-Back Headphones",
                description: "Reference-grade audio analytical headphones with linear frequency response.",
                categoryName: "Electronics & Tech", subcategory: "Headphones", condition: "EXCELLENT",
                images: ["https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600"],
                prefCat: "Musical Instruments", prefSub: "Studio Microphone"
            },
            {
                ownerId: priya._id, title: "Seiko 5 Sports Automatic Watch (SRPD55K1)",
                description: "Automatic movement watch with black dial, stainless steel bracelet, and 100m water resistance.",
                categoryName: "Fashion & Accessories", subcategory: "Analog Watch", condition: "EXCELLENT",
                images: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600"],
                prefCat: "Electronics & Tech", prefSub: "Microphone"
            },
            {
                ownerId: priya._id, title: "Kindle Paperwhite (11th Gen - 8GB)",
                description: "6.8-inch display with adjustable warm light and waterproof casing. Holds thousands of books.",
                categoryName: "Electronics & Tech", subcategory: "Tablet", condition: "LIKE_NEW",
                images: ["https://images.unsplash.com/photo-1592496001020-d31bd830651f?w=600"],
                prefCat: "Books & Education", prefSub: "Fiction"
            },
            {
                ownerId: priya._id, title: "Stentor Student II Violin (Full Size 4/4)",
                description: "Solid carved spruce top with maple back and sides. Ebony pegs and fingerboard with bow & case.",
                categoryName: "Musical Instruments", subcategory: "Violin", condition: "GOOD",
                images: ["https://images.unsplash.com/photo-1612225330812-01a9c6b355ec?w=600"],
                prefCat: "Books & Education", prefSub: "Programming"
            },
            {
                ownerId: priya._id, title: "Clean Code + The Pragmatic Programmer (Book Bundle)",
                description: "Must-read software development books in excellent condition. No markings inside.",
                categoryName: "Books & Education", subcategory: "Programming", condition: "LIKE_NEW",
                images: ["https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600"],
                prefCat: "Books & Education", prefSub: "Engineering"
            },
            {
                ownerId: priya._id, title: "Epiphone Les Paul Standard '50s (Heritage Cherry)",
                description: "Mahogany body with maple cap, ProBucker humbucker pickups, vintage 50s neck profile.",
                categoryName: "Musical Instruments", subcategory: "Electric Guitar", condition: "EXCELLENT",
                images: ["https://images.unsplash.com/photo-1550985616-10810253b84d?w=600"],
                prefCat: "Musical Instruments", prefSub: "Bass Guitar"
            },
            {
                ownerId: priya._id, title: "TC Electronic Hall of Fame 2 Reverb Pedal",
                description: "Iconic guitar reverb pedal with MASH pressure sensitive footswitch and TonePrint slots.",
                categoryName: "Musical Instruments", subcategory: "Effects Pedal", condition: "LIKE_NEW",
                images: ["https://images.unsplash.com/photo-1593697972400-26778736382f?w=600"],
                prefCat: "Musical Instruments", prefSub: "Guitar Amplifier"
            },

            // ================= ANANYA (14 items) =================
            {
                ownerId: ananya._id, title: "De'Longhi Dedica Deluxe Espresso Coffee Machine",
                description: "15-bar pump pressure espresso maker with adjustable milk frother wand. Stainless steel.",
                categoryName: "Home & Appliances", subcategory: "Coffee Machine", condition: "LIKE_NEW",
                images: ["https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=600"],
                prefCat: "Sports & Fitness", prefSub: "Yoga Mat"
            },
            {
                ownerId: ananya._id, title: "Yonex Voltric Z Force II Badminton Racquet",
                description: "Extra stiff flex head-heavy racquet with BG65 Ti strings. Maximum power for smashes.",
                categoryName: "Sports & Fitness", subcategory: "Badminton Racquet", condition: "EXCELLENT",
                images: ["https://images.unsplash.com/photo-1626225967045-9440882262bf?w=600"],
                prefCat: "Sports & Fitness", prefSub: "Tennis Racquet"
            },
            {
                ownerId: ananya._id, title: "Dyson V11 Absolute Cordless Vacuum Cleaner",
                description: "Intelligent cordless vacuum cleaner with Torque Drive cleaner head and LCD screen.",
                categoryName: "Home & Appliances", subcategory: "Vacuum Cleaner", condition: "EXCELLENT",
                images: ["https://images.unsplash.com/photo-1558317374-067fb5f30001?w=600"],
                prefCat: "Electronics & Tech", prefSub: "Power Bank"
            },
            {
                ownerId: ananya._id, title: "Philips Air Fryer HD9252/90 (Digital Touch)",
                description: "Rapid Air technology air fryer with 7 preset cooking modes. 4.1-litre capacity.",
                categoryName: "Home & Appliances", subcategory: "Air Fryer", condition: "LIKE_NEW",
                images: ["https://images.unsplash.com/photo-1585515320310-259814833e62?w=600"],
                prefCat: "Home & Appliances", prefSub: "Blender"
            },
            {
                ownerId: ananya._id, title: "Ray-Ban Classic Wayfarer Sunglasses (G-15 Lens)",
                description: "Original Black Wayfarer RB2140 with green G-15 glass lenses. Case and cloth included.",
                categoryName: "Fashion & Accessories", subcategory: "Sunglasses", condition: "EXCELLENT",
                images: ["https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600"],
                prefCat: "Fashion & Accessories", prefSub: "Backpack"
            },
            {
                ownerId: ananya._id, title: "Fossil Men's Genuine Leather Backpack (Dark Brown)",
                description: "Full grain vintage leather backpack with 15-inch padded laptop compartment.",
                categoryName: "Fashion & Accessories", subcategory: "Backpack", condition: "EXCELLENT",
                images: ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600"],
                prefCat: "Fashion & Accessories", prefSub: "Sunglasses"
            },
            {
                ownerId: ananya._id, title: "Nike Air Jordan 1 Retro High OG (Chicago - UK 9)",
                description: "Classic Red/White/Black colorway. Worn twice, immaculate midsole condition with original box.",
                categoryName: "Fashion & Accessories", subcategory: "Sneakers", condition: "LIKE_NEW",
                images: ["https://images.unsplash.com/photo-1552346154-21d32810aba3?w=600"],
                prefCat: "Gaming", prefSub: "PlayStation"
            },
            {
                ownerId: ananya._id, title: "Xiaomi Smart Air Purifier 4 (HEPA Filter)",
                description: "Removes 99.97% of airborne particles. Quiet operation with OLED touch display & app control.",
                categoryName: "Home & Appliances", subcategory: "Air Purifier", condition: "LIKE_NEW",
                images: ["https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=600"],
                prefCat: "Home & Appliances", prefSub: "Desk Lamp"
            },
            {
                ownerId: ananya._id, title: "BenQ WiT e-Reading LED Desk Lamp",
                description: "Wide angle lighting LED desk lamp with auto-dimming and customizable color temperature.",
                categoryName: "Home & Appliances", subcategory: "Desk Lamp", condition: "EXCELLENT",
                images: ["https://images.unsplash.com/photo-1534073828943-f801091bb18c?w=600"],
                prefCat: "Home & Appliances", prefSub: "Air Purifier"
            },
            {
                ownerId: ananya._id, title: "NutriBullet Pro 900W High-Speed Blender Set",
                description: "900-watt nutrient extractor blender with 2 cups, lip rings, and recipe book.",
                categoryName: "Home & Appliances", subcategory: "Blender", condition: "GOOD",
                images: ["https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=600"],
                prefCat: "Home & Appliances", prefSub: "Air Fryer"
            },
            {
                ownerId: ananya._id, title: "Nespresso Lattissima Touch Coffee Machine",
                description: "One-touch cappuccino and latte macchiato system with 19-bar high pressure pump.",
                categoryName: "Home & Appliances", subcategory: "Coffee Machine", condition: "LIKE_NEW",
                images: ["https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600"],
                prefCat: "Home & Appliances", prefSub: "Vacuum Cleaner"
            },
            {
                ownerId: ananya._id, title: "Adidas Ultraboost Light Running Shoes (UK 8.5)",
                description: "Lightest Ultraboost ever made with Light BOOST material and Primeknit+ upper.",
                categoryName: "Fashion & Accessories", subcategory: "Sneakers", condition: "LIKE_NEW",
                images: ["https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=600"],
                prefCat: "Sports & Fitness", prefSub: "Yoga Mat"
            },
            {
                ownerId: ananya._id, title: "Bose SoundLink Revolve+ II Bluetooth Speaker",
                description: "360-degree deep immersive sound speaker with flexible fabric handle and 17-hour battery.",
                categoryName: "Electronics & Tech", subcategory: "Bluetooth Speaker", condition: "EXCELLENT",
                images: ["https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600"],
                prefCat: "Electronics & Tech", prefSub: "Smartwatch"
            },
            {
                ownerId: ananya._id, title: "Casio G-Shock GA-2100 'CasiOak' All Black",
                description: "Ultra-slim octagonal bezel G-Shock with carbon core guard structure. 200m water resistant.",
                categoryName: "Fashion & Accessories", subcategory: "Analog Watch", condition: "LIKE_NEW",
                images: ["https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600"],
                prefCat: "Fashion & Accessories", prefSub: "Sunglasses"
            }
        ];

        const itemDocsData = rawItems.map(item => {
            const cat = catMap[item.categoryName];
            const prefCatObj = catMap[item.prefCat];

            return {
                ownerId: item.ownerId,
                title: item.title,
                description: item.description,
                categoryId: cat._id,
                subcategory: item.subcategory,
                condition: item.condition,
                images: item.images,
                exchangePreferences: prefCatObj ? [
                    { categoryId: prefCatObj._id, subcategory: item.prefSub, priority: 1 }
                ] : [],
                status: "AVAILABLE",
                viewCount: Math.floor(Math.random() * 90) + 10,
                favoriteCount: Math.floor(Math.random() * 20)
            };
        });

        const createdItems = await Item.insertMany(itemDocsData);
        console.log(`📦 Created ${createdItems.length} Listings across 5 Accounts (14 items per user)`);

        const findItem = (t) => createdItems.find(i => i.title.includes(t));

        const macbook = findItem("MacBook Air M2");
        const guitar = findItem("Fender CD-60S");
        const drone = findItem("DJI Mini 3");
        const camera = findItem("Canon EOS R6");
        const ps5 = findItem("PlayStation 5");
        const headphones = findItem("WH-1000XM5");
        const piano = findItem("Yamaha P-125");
        const coffee = findItem("Coffee Machine");

        // ── 4. CREATE ACTIVE & COMPLETED ROOMS ───────────────────────

        // [A] DIRECT 2-Way Room (Alex ↔ Vikram) — ACTIVE (1/2 confirmed)
        const directReq = await ExchangeRequest.create({
            requesterId: alex._id,
            receiverId: vikram._id,
            offeredItemId: macbook._id,
            requestedItemId: guitar._id,
            status: "ACCEPTED",
            note: "Hey Vikram! Let's swap my MacBook Air for your Fender Guitar."
        });

        const directRoom = await ExchangeRoom.create({
            exchangeType: "DIRECT",
            exchangeRequestId: directReq._id,
            participants: [
                { userId: alex._id, role: "INITIATOR", status: "ACCEPTED" },
                { userId: vikram._id, role: "PARTICIPANT", status: "ACCEPTED" }
            ],
            items: [
                { itemId: macbook._id, fromUserId: alex._id, toUserId: vikram._id },
                { itemId: guitar._id, fromUserId: vikram._id, toUserId: alex._id }
            ],
            meetingDetails: {
                location: "Phoenix Mall, Lower Parel, Mumbai",
                date: "2026-08-25",
                time: "15:00"
            },
            completionConfirmations: [alex._id], // Alex confirmed — waiting for Vikram
            status: "ACTIVE"
        });

        await Item.updateMany({ _id: { $in: [macbook._id, guitar._id] } }, { status: "PENDING" });

        // [B] 3-WAY Exchange Ring (Alex → Vikram → Rahul → Alex) — ACTIVE
        const threeWayRoom = await ExchangeRoom.create({
            exchangeType: "THREE_WAY",
            participants: [
                { userId: alex._id, role: "INITIATOR", status: "ACCEPTED" },
                { userId: vikram._id, role: "PARTICIPANT", status: "ACCEPTED" },
                { userId: rahul._id, role: "PARTICIPANT", status: "ACCEPTED" }
            ],
            items: [
                { itemId: drone._id, fromUserId: alex._id, toUserId: vikram._id },
                { itemId: camera._id, fromUserId: vikram._id, toUserId: rahul._id },
                { itemId: ps5._id, fromUserId: rahul._id, toUserId: alex._id }
            ],
            meetingDetails: {
                location: "Cyber City Hub, Gurugram",
                date: "2026-08-28",
                time: "17:00"
            },
            completionConfirmations: [],
            status: "ACTIVE"
        });

        await Item.updateMany({ _id: { $in: [drone._id, camera._id, ps5._id] } }, { status: "PENDING" });

        // [C] COMPLETED Exchange Room (Priya ↔ Ananya) — COMPLETED with REVIEWS
        const completedReq = await ExchangeRequest.create({
            requesterId: priya._id,
            receiverId: ananya._id,
            offeredItemId: piano._id,
            requestedItemId: coffee._id,
            status: "COMPLETED",
            note: "Thanks Ananya for the awesome espresso machine!"
        });

        const completedRoom = await ExchangeRoom.create({
            exchangeType: "DIRECT",
            exchangeRequestId: completedReq._id,
            participants: [
                { userId: priya._id, role: "INITIATOR", status: "ACCEPTED" },
                { userId: ananya._id, role: "PARTICIPANT", status: "ACCEPTED" }
            ],
            items: [
                { itemId: piano._id, fromUserId: priya._id, toUserId: ananya._id },
                { itemId: coffee._id, fromUserId: ananya._id, toUserId: priya._id }
            ],
            meetingDetails: {
                location: "Express Avenue Mall, Chennai",
                date: "2026-08-10",
                time: "11:00"
            },
            completionConfirmations: [priya._id, ananya._id],
            status: "COMPLETED"
        });

        await Item.updateMany({ _id: { $in: [piano._id, coffee._id] } }, { status: "EXCHANGED" });

        // [D] PENDING Request (Rahul sent to Alex)
        await ExchangeRequest.create({
            requesterId: rahul._id,
            receiverId: alex._id,
            offeredItemId: findItem("Arctis Nova Pro")._id,
            requestedItemId: headphones._id,
            status: "PENDING",
            note: "Hi Alex, would you swap your Sony Headphones for my SteelSeries headset?"
        });

        console.log("🏠 Created Active & Completed Exchange Rooms");

        // ── 5. MESSAGES & REVIEWS ────────────────────────────────────

        // Messages for Direct Room (Alex ↔ Vikram)
        await Message.insertMany([
            { roomId: directRoom._id, senderId: alex._id, text: "Hey Vikram! Excited about swapping the MacBook for your Fender guitar.", type: "TEXT" },
            { roomId: directRoom._id, senderId: vikram._id, text: "Hey Alex! Sounds great. The guitar is tuned and ready in its padded gig bag.", type: "TEXT" },
            { roomId: directRoom._id, senderId: alex._id, text: "📍 Location: Phoenix Mall, Lower Parel, Mumbai | 📅 Date: 2026-08-25 | ⏰ Time: 15:00", type: "MEETING" },
            { roomId: directRoom._id, senderId: vikram._id, text: "See you at Phoenix Mall at 3 PM!", type: "TEXT" }
        ]);

        // Messages for 3-Way Room (Alex ↔ Vikram ↔ Rahul)
        await Message.insertMany([
            { roomId: threeWayRoom._id, senderId: alex._id, text: "Welcome everyone to our 3-Way Barter Ring!", type: "TEXT" },
            { roomId: threeWayRoom._id, senderId: vikram._id, text: "Awesome! I get the DJI Drone, Rahul gets the Canon Mirrorless, and Alex gets the PS5!", type: "TEXT" },
            { roomId: threeWayRoom._id, senderId: rahul._id, text: "Perfect triangular trade! Let me know when you guys want to confirm.", type: "TEXT" }
        ]);

        // Reviews for Completed Room (Priya ↔ Ananya)
        await Review.create([
            {
                exchangeRoomId: completedRoom._id,
                exchangeRequestId: completedReq._id,
                reviewerId: priya._id,
                revieweeId: ananya._id,
                rating: 5,
                comment: "Ananya was fantastic! The espresso machine works perfectly and was packaged so carefully."
            },
            {
                exchangeRoomId: completedRoom._id,
                exchangeRequestId: completedReq._id,
                reviewerId: ananya._id,
                revieweeId: priya._id,
                rating: 5,
                comment: "Priya is a wonderful trader. The digital piano is in pristine shape. 10/10 recommended!"
            }
        ]);

        console.log("💬 Inserted Chat Messages & Reviews");

        // ── 6. FINAL SUMMARY ─────────────────────────────────────────
        console.log("\n════════════════════════════════════════════════════════════════════");
        console.log("🎉 70 LISTINGS MASTER SEED COMPLETE!");
        console.log("════════════════════════════════════════════════════════════════════\n");

        console.log("🔑  LOGIN CREDENTIALS (password: pass123 for all):");
        console.log("   1. alex@swapsphere.com     (Mumbai)    — 14 items | Active 2-Way room (1/2 confirmed) & Active 3-Way room");
        console.log("   2. vikram@swapsphere.com   (Delhi)     — 14 items | Active 2-Way room (needs to click confirm) & 3-Way room");
        console.log("   3. rahul@swapsphere.com    (Bangalore) — 14 items | Active 3-Way room participant & Pending request sent to Alex");
        console.log("   4. priya@swapsphere.com    (Chennai)   — 14 items | Completed exchange with Ananya + 5-star review");
        console.log("   5. ananya@swapsphere.com   (Pune)      — 14 items | Completed exchange with Priya + 5-star review\n");

        console.log("🧪  WHAT TO TEST:");
        console.log("   1️⃣  Dashboard '⭐ Leave a Review' Button & Pop-Up Alert Modal:");
        console.log("       • Log in as vikram@swapsphere.com → Go to /exchange-room/... → Click 'Confirm Exchange Complete'.");
        console.log("       • Exchange turns COMPLETED! Go to /dashboard → Click '⭐ Leave a Review' button next to completed exchange.");
        console.log("       • Submit a review → Pop-up modal appears with '⭐ Review Submitted!'.");
        console.log("       • Click '⭐ Leave a Review' again → Pop-up modal pops up with 'ℹ️ You have already reviewed this user for this exchange'.");
        console.log("\n   2️⃣  2-Way Exchange Room Bug Fixed:");
        console.log("       • Open 2-Way Exchange Room between Alex & Vikram. All item cards (You offer / You receive / Listed By) load 100% correctly!");
        console.log("\n   3️⃣  70 Marketplace Listings:");
        console.log("       • Go to /marketplace → Browse 70 listings across all categories!");

        console.log("\n════════════════════════════════════════════════════════════════════\n");

        await mongoose.disconnect();
        console.log("🔌 Disconnected from MongoDB. 70 Listings seed complete!");
    } catch (err) {
        console.error("❌ Seed failed:", err);
        process.exit(1);
    }
}

seed70();
