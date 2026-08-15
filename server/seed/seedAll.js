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
        await User.deleteMany({ email: { $in: ["alex@swapsphere.com", "vikram@swapsphere.com", "rahul@swapsphere.com", "admin@swapsphere.com", "justin@swapsphere.com"] } });

        console.log("🗑️ Cleared existing test data");

        // 2. Create Broad Top-Level Categories with Specific Noun Subcategories
        const categoriesData = [
            {
                name: "Electronics & Tech",
                icon: "💻",
                description: "Cameras, smartphones, laptops, headphones, monitors, tablets, and gadgets",
                subcategories: [
                    "Laptop",
                    "MacBook",
                    "Smartphone",
                    "Tablet",
                    "iPad",
                    "DSLR Camera",
                    "Mirrorless Camera",
                    "Camera Lens",
                    "Headphones",
                    "Wireless Earbuds",
                    "Bluetooth Speaker",
                    "Monitor",
                    "Desktop PC",
                    "Smartwatch",
                    "Power Bank",
                    "Microphone",
                    "Drone",
                    "Action Camera"
                ]
            },
            {
                name: "Musical Instruments",
                icon: "🎸",
                description: "Guitars, keyboards, drums, violins, studio audio, amplifiers, and pedals",
                subcategories: [
                    "Acoustic Guitar",
                    "Electric Guitar",
                    "Bass Guitar",
                    "Ukulele",
                    "Digital Piano",
                    "Keyboard Synthesizer",
                    "MIDI Controller",
                    "Electronic Drum Kit",
                    "Acoustic Drum Kit",
                    "Violin",
                    "Studio Microphone",
                    "Guitar Amplifier",
                    "Effects Pedal"
                ]
            },
            {
                name: "Sports & Fitness",
                icon: "⚽",
                description: "Gym dumbbells, mountain cycles, cricket gear, badminton racquets, and camping",
                subcategories: [
                    "Dumbbell Set",
                    "Kettlebell",
                    "Weight Bench",
                    "Mountain Bike",
                    "Road Bike",
                    "Cricket Bat",
                    "Cricket Pad Set",
                    "Football",
                    "Basketball",
                    "Badminton Racquet",
                    "Tennis Racquet",
                    "Camping Tent",
                    "Sleeping Bag",
                    "Hiking Rucksack",
                    "Skateboard"
                ]
            },
            {
                name: "Furniture & Home",
                icon: "🛋️",
                description: "Ergonomic mesh chairs, study tables, sofas, beds, lighting, and home decor",
                subcategories: [
                    "Ergonomic Mesh Chair",
                    "Study Desk",
                    "Standing Desk",
                    "Sofa",
                    "Recliner Chair",
                    "Bean Bag",
                    "Bed Frame",
                    "Bookshelf",
                    "Table Lamp",
                    "Wall Art Frame",
                    "Dining Table"
                ]
            },
            {
                name: "Books & Literature",
                icon: "📚",
                description: "Computer science books, academic textbooks, fiction novels, non-fiction, and comics",
                subcategories: [
                    "Computer Science Book",
                    "Engineering Textbook",
                    "Entrance Exam Guide",
                    "Fiction Novel",
                    "Sci-Fi Novel",
                    "Mystery Novel",
                    "Self-Help Book",
                    "Comic Book",
                    "Manga Volume",
                    "School Textbook"
                ]
            },
            {
                name: "Fashion & Apparel",
                icon: "👕",
                description: "Men & women clothing, jackets, sneakers, boots, wristwatches, and backpacks",
                subcategories: [
                    "Men Shirt",
                    "Women Dress",
                    "Leather Jacket",
                    "Denim Jacket",
                    "Sneakers",
                    "Running Shoes",
                    "Leather Boots",
                    "Analog Watch",
                    "Smartwatch",
                    "Laptop Backpack",
                    "Sunglasses"
                ]
            },
            {
                name: "Gaming & Entertainment",
                icon: "🎮",
                description: "PlayStation 5, Xbox, Nintendo Switch, video game discs, and gaming accessories",
                subcategories: [
                    "PlayStation 5",
                    "PS4 Console",
                    "Xbox Series X",
                    "Nintendo Switch",
                    "PS5 Game Disc",
                    "Switch Game Cartridge",
                    "Gaming Controller",
                    "VR Headset",
                    "Gaming Chair"
                ]
            },
            {
                name: "Home & Kitchen Appliances",
                icon: "🍳",
                description: "Espresso coffee makers, air fryers, microwaves, vacuum cleaners, and kitchen gear",
                subcategories: [
                    "Espresso Coffee Maker",
                    "Air Fryer",
                    "Microwave Oven",
                    "Vacuum Cleaner",
                    "Robot Vacuum",
                    "Juicer Blender",
                    "Electric Kettle",
                    "Toaster",
                    "Water Purifier"
                ]
            },
            {
                name: "Hobbies, Toys & Collectibles",
                icon: "🎨",
                description: "Board games, action figures, art supplies, baby toys, and collectibles",
                subcategories: [
                    "Strategy Board Game",
                    "Chess Set",
                    "Action Figure",
                    "Funko Pop",
                    "Diecast Model Car",
                    "Acrylic Paint Set",
                    "Canvas Board",
                    "Baby Stroller",
                    "Lego Building Set",
                    "RC Car"
                ]
            },
            {
                name: "Vehicles & Mobility",
                icon: "🛵",
                description: "Electric cycles, electric scooters, riding helmets, bicycle racks, and car accessories",
                subcategories: [
                    "Electric Scooter",
                    "Electric Bicycle",
                    "Riding Helmet",
                    "Bicycle Rack",
                    "Security Lock",
                    "Car Dash Cam"
                ]
            },
            {
                name: "Tools & DIY",
                icon: "🛠️",
                description: "Cordless power drills, mechanic hand tool kits, soldering irons, and toolboxes",
                subcategories: [
                    "Cordless Power Drill",
                    "Hand Tool Kit",
                    "Soldering Iron",
                    "Toolbox Organizer",
                    "Measuring Laser",
                    "Workbench"
                ]
            }
        ];

        const createdCategories = await Category.insertMany(categoriesData);
        console.log(`✅ Seeded ${createdCategories.length} distinct categories`);

        const catMap = {};
        createdCategories.forEach((c) => {
            catMap[c.name.toLowerCase()] = c._id;
        });

        // 3. Create Demo Users (Admin has 0 items and is purely for management)
        const hashedPassword = await bcrypt.hash("password123", 10);

        const usersData = [
            {
                fullName: "Alex Rivera",
                email: "alex@swapsphere.com",
                password: hashedPassword,
                location: "Kottayam, Kerala",
                bio: "Tech enthusiast and camera buff looking for quality guitar and gaming gear.",
                profilePicture: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
                totalCompletedExchanges: 4,
                averageRating: 4.8,
                exchangeSuccessRate: 95
            },
            {
                fullName: "Vikram Sharma",
                email: "vikram@swapsphere.com",
                password: hashedPassword,
                location: "Kochi, Kerala",
                bio: "Musician & outdoor cyclist. Always open for fair barter exchanges!",
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
                bio: "Fitness fanatic & gamer looking for high-end camera & audio gear.",
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

        const [alex, vikram, rahul, admin] = await User.insertMany(usersData);
        console.log(`✅ Seeded 4 demo users (Admin owns 0 items and is purely system manager)`);

        // 4. Create 50 Unique Real Barter Items across Alex, Vikram, and Rahul
        const itemsData = [
            // --- ALEX'S ITEMS (17 UNIQUE ITEMS) ---
            {
                ownerId: alex._id,
                title: "Canon EOS 200D DSLR Camera",
                description: "Lightly used Canon 200D DSLR with 18-55mm IS STM lens. Crisp 24.2 MP sensor, dual pixel autofocus, built-in Wi-Fi & Bluetooth. Includes camera bag and 32GB SD card.",
                categoryId: catMap["electronics & tech"],
                subcategory: "DSLR Camera",
                condition: "EXCELLENT",
                images: ["https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80"],
                exchangePreferences: [
                    { categoryId: catMap["musical instruments"], subcategory: "Acoustic Guitar", priority: 1 },
                    { categoryId: catMap["electronics & tech"], subcategory: "MacBook", priority: 2 }
                ]
            },
            {
                ownerId: alex._id,
                title: "Sony WH-1000XM4 Noise Canceling Headphones",
                description: "Industry leading noise cancellation over-ear headphones in Midnight Blue. Superior audio clarity, multipoint connection, and 30-hour battery life.",
                categoryId: catMap["electronics & tech"],
                subcategory: "Headphones",
                condition: "LIKE_NEW",
                images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80"],
                exchangePreferences: [
                    { categoryId: catMap["sports & fitness"], subcategory: "Mountain Bike", priority: 1 },
                    { categoryId: catMap["gaming & entertainment"], subcategory: "PlayStation 5", priority: 2 }
                ]
            },
            {
                ownerId: alex._id,
                title: "Apple MacBook Air M1 256GB Space Gray",
                description: "Apple MacBook Air with M1 chip, 8GB Unified RAM, 256GB SSD. Battery cycle count under 50. Comes with original charger and box.",
                categoryId: catMap["electronics & tech"],
                subcategory: "MacBook",
                condition: "LIKE_NEW",
                images: ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80"],
                exchangePreferences: [
                    { categoryId: catMap["home & kitchen appliances"], subcategory: "Espresso Coffee Maker", priority: 1 },
                    { categoryId: catMap["electronics & tech"], subcategory: "Smartphone", priority: 2 }
                ]
            },
            {
                ownerId: alex._id,
                title: "Apple iPad Air 4th Gen 64GB Space Gray",
                description: "Apple iPad Air 4 with A14 Bionic chip, 10.9-inch Liquid Retina Display. Includes magnetic leather smart cover.",
                categoryId: catMap["electronics & tech"],
                subcategory: "iPad",
                condition: "EXCELLENT",
                images: ["https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&auto=format&fit=crop&q=80"],
                exchangePreferences: [
                    { categoryId: catMap["gaming & entertainment"], subcategory: "Nintendo Switch", priority: 1 }
                ]
            },
            {
                ownerId: alex._id,
                title: "iPhone 13 Pro 128GB Sierra Blue",
                description: "iPhone 13 Pro in pristine condition. 120Hz ProMotion Super Retina XDR display, triple lens camera system with Macro mode. 88% battery health.",
                categoryId: catMap["electronics & tech"],
                subcategory: "Smartphone",
                condition: "EXCELLENT",
                images: ["https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80"],
                exchangePreferences: [
                    { categoryId: catMap["musical instruments"], subcategory: "Electric Guitar", priority: 1 }
                ]
            },
            {
                ownerId: alex._id,
                title: "Dell UltraSharp 27-inch 4K USB-C Monitor",
                description: "Dell U2720Q 27-inch 4K UHD IPS Monitor with HDR 400, 95% DCI-P3 color gamut, USB-C 90W power delivery. Perfect for photography & video editing.",
                categoryId: catMap["electronics & tech"],
                subcategory: "Monitor",
                condition: "LIKE_NEW",
                images: ["https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80"],
                exchangePreferences: [
                    { categoryId: catMap["electronics & tech"], subcategory: "Smartwatch", priority: 1 }
                ]
            },
            {
                ownerId: alex._id,
                title: "Bose SoundLink Revolve+ Bluetooth Speaker",
                description: "360-degree deep immersive sound Bluetooth speaker with flexible fabric handle. Water-resistant IP55 rating, up to 17 hours of battery runtime.",
                categoryId: catMap["electronics & tech"],
                subcategory: "Bluetooth Speaker",
                condition: "EXCELLENT",
                images: ["https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop&q=80"],
                exchangePreferences: [
                    { categoryId: catMap["electronics & tech"], subcategory: "Wireless Earbuds", priority: 1 }
                ]
            },
            {
                ownerId: alex._id,
                title: "DJI Mini 2 4K Ultralight Drone",
                description: "Ultralight foldable drone weighing under 249g. 4K/30fps video, 10km video transmission, 31-min flight time. Includes controller and 3 batteries.",
                categoryId: catMap["electronics & tech"],
                subcategory: "Drone",
                condition: "LIKE_NEW",
                images: ["https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=800&auto=format&fit=crop&q=80"],
                exchangePreferences: [
                    { categoryId: catMap["electronics & tech"], subcategory: "Action Camera", priority: 1 }
                ]
            },
            {
                ownerId: alex._id,
                title: "GoPro HERO10 Black Action Camera 5.3K",
                description: "GoPro HERO10 Black with GP2 engine. 5.3K60 video, 23MP photos, HyperSmooth 4.0 stabilization, waterproof to 33ft.",
                categoryId: catMap["electronics & tech"],
                subcategory: "Action Camera",
                condition: "EXCELLENT",
                images: ["https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&auto=format&fit=crop&q=80"],
                exchangePreferences: [
                    { categoryId: catMap["electronics & tech"], subcategory: "Drone", priority: 1 }
                ]
            },
            {
                ownerId: alex._id,
                title: "Apple Watch Series 7 GPS 45mm Midnight",
                description: "Apple Watch Series 7 with Always-On Retina display, blood oxygen & ECG apps, fast charging USB-C magnetic cable.",
                categoryId: catMap["electronics & tech"],
                subcategory: "Smartwatch",
                condition: "LIKE_NEW",
                images: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80"],
                exchangePreferences: [
                    { categoryId: catMap["electronics & tech"], subcategory: "Wireless Earbuds", priority: 1 }
                ]
            },
            {
                ownerId: alex._id,
                title: "Sony WF-1000XM4 Noise Canceling Wireless Earbuds",
                description: "Sony flagship TWS earbuds with V1 processor, LDAC codec support, IPX4 water resistance, and wireless charging case.",
                categoryId: catMap["electronics & tech"],
                subcategory: "Wireless Earbuds",
                condition: "LIKE_NEW",
                images: ["https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80"],
                exchangePreferences: [
                    { categoryId: catMap["electronics & tech"], subcategory: "Smartwatch", priority: 1 }
                ]
            },
            {
                ownerId: alex._id,
                title: "Keychron K2 Wireless Mechanical Keyboard",
                description: "75% layout wireless mechanical keyboard with Gateron Brown tactile switches, RGB backlighting, Mac and Windows keycaps.",
                categoryId: catMap["electronics & tech"],
                subcategory: "Desktop PC",
                condition: "LIKE_NEW",
                images: ["https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80"],
                exchangePreferences: [
                    { categoryId: catMap["electronics & tech"], subcategory: "Monitor", priority: 1 }
                ]
            },
            {
                ownerId: alex._id,
                title: "Meta Quest 2 Advanced All-In-One VR Headset 128GB",
                description: "Meta Quest 2 VR headset with 3D positional audio, 1832x1920 resolution per eye, and 2 Touch controllers.",
                categoryId: catMap["gaming & entertainment"],
                subcategory: "VR Headset",
                condition: "EXCELLENT",
                images: ["https://images.unsplash.com/photo-1622979135225-d2ba269bc1bd?w=800&auto=format&fit=crop&q=80"],
                exchangePreferences: [
                    { categoryId: catMap["gaming & entertainment"], subcategory: "Nintendo Switch", priority: 1 }
                ]
            },
            {
                ownerId: alex._id,
                title: "Anker PowerCore 26800mAh Heavy Duty Power Bank",
                description: "Colossal capacity 26800mAh portable charger with 3 USB output ports, high-speed PowerIQ charging technology.",
                categoryId: catMap["electronics & tech"],
                subcategory: "Power Bank",
                condition: "EXCELLENT",
                images: ["https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=800&auto=format&fit=crop&q=80"],
                exchangePreferences: [
                    { categoryId: catMap["electronics & tech"], subcategory: "Wireless Earbuds", priority: 1 }
                ]
            },
            {
                ownerId: alex._id,
                title: "Kala Concert Ukulele Mahogany Satin Finish",
                description: "Kala KA-C Mahogany Concert Ukulele. Traditional satin finish, rosewood fingerboard, Aquila Super Nylgut strings.",
                categoryId: catMap["musical instruments"],
                subcategory: "Ukulele",
                condition: "LIKE_NEW",
                images: ["https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800&auto=format&fit=crop&q=80"],
                exchangePreferences: [
                    { categoryId: catMap["musical instruments"], subcategory: "Acoustic Guitar", priority: 1 }
                ]
            },
            {
                ownerId: alex._id,
                title: "Ray-Ban Wayfarer Classic Polarized Sunglasses",
                description: "Original Ray-Ban RB2140 Wayfarer sunglasses in G-15 green polarized lenses and black acetate frame. Includes case & cloth.",
                categoryId: catMap["fashion & apparel"],
                subcategory: "Sunglasses",
                condition: "LIKE_NEW",
                images: ["https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&auto=format&fit=crop&q=80"],
                exchangePreferences: [
                    { categoryId: catMap["fashion & apparel"], subcategory: "Analog Watch", priority: 1 }
                ]
            },
            {
                ownerId: alex._id,
                title: "Segway Ninebot MAX Electric Kick Scooter",
                description: "Ninebot MAX G30P electric scooter with 40-mile range, 18.6 mph top speed, 10-inch pneumatic tires, built-in charger.",
                categoryId: catMap["vehicles & mobility"],
                subcategory: "Electric Scooter",
                condition: "EXCELLENT",
                images: ["https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&auto=format&fit=crop&q=80"],
                exchangePreferences: [
                    { categoryId: catMap["sports & fitness"], subcategory: "Mountain Bike", priority: 1 }
                ]
            },

            // --- VIKRAM'S ITEMS (17 UNIQUE ITEMS) ---
            {
                ownerId: vikram._id,
                title: "Yamaha F310 Acoustic Guitar Natural",
                description: "Authentic Yamaha F310 Dreadnought Acoustic Guitar. Rich warm tone, spruce top, rosewood fingerboard. Includes padded gig bag and tuner.",
                categoryId: catMap["musical instruments"],
                subcategory: "Acoustic Guitar",
                condition: "LIKE_NEW",
                images: ["https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800&auto=format&fit=crop&q=80"],
                exchangePreferences: [
                    { categoryId: catMap["electronics & tech"], subcategory: "DSLR Camera", priority: 1 },
                    { categoryId: catMap["sports & fitness"], subcategory: "Dumbbell Set", priority: 2 }
                ]
            },
            {
                ownerId: vikram._id,
                title: "Trek Marlin 5 Mountain Bike Disc Brakes",
                description: "Trek Marlin 5 trail mountain bicycle. 21-speed Shimano gearing, SR Suntour suspension fork, and mechanical disc brakes. Smooth on road and trail.",
                categoryId: catMap["sports & fitness"],
                subcategory: "Mountain Bike",
                condition: "GOOD",
                images: ["https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800&auto=format&fit=crop&q=80"],
                exchangePreferences: [
                    { categoryId: catMap["furniture & home"], subcategory: "Ergonomic Mesh Chair", priority: 1 }
                ]
            },
            {
                ownerId: vikram._id,
                title: "DeLonghi Dedica Espresso Coffee Maker",
                description: "Slim DeLonghi Dedica pump espresso maker. 15-bar pressure, stainless steel body, adjustable milk frother for cappuccinos and lattes.",
                categoryId: catMap["home & kitchen appliances"],
                subcategory: "Espresso Coffee Maker",
                condition: "EXCELLENT",
                images: ["https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800&auto=format&fit=crop&q=80"],
                exchangePreferences: [
                    { categoryId: catMap["gaming & entertainment"], subcategory: "PlayStation 5", priority: 1 }
                ]
            },
            {
                ownerId: vikram._id,
                title: "Fender Player Stratocaster Electric Guitar Sunburst",
                description: "Fender Player Series Stratocaster in 3-Color Sunburst. Alder body, maple neck, 3 Player Series single-coil pickups, 5-way switch. Comes with hard case.",
                categoryId: catMap["musical instruments"],
                subcategory: "Electric Guitar",
                condition: "LIKE_NEW",
                images: ["https://images.unsplash.com/photo-1564186763535-ebb21ef5277f?w=800&auto=format&fit=crop&q=80"],
                exchangePreferences: [
                    { categoryId: catMap["musical instruments"], subcategory: "Guitar Amplifier", priority: 1 }
                ]
            },
            {
                ownerId: vikram._id,
                title: "Roland FP-30X 88-Key Digital Piano",
                description: "Roland FP-30X digital piano with 88 weighted PHA-4 Standard keys, SuperNATURAL Piano sound engine, built-in Bluetooth audio & MIDI.",
                categoryId: catMap["musical instruments"],
                subcategory: "Digital Piano",
                condition: "EXCELLENT",
                images: ["https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=800&auto=format&fit=crop&q=80"],
                exchangePreferences: [
                    { categoryId: catMap["electronics & tech"], subcategory: "iPad", priority: 1 }
                ]
            },
            {
                ownerId: vikram._id,
                title: "Alesis Nitro Mesh Electronic Drum Kit",
                description: "8-piece electronic drum set with quiet mesh heads. Nitro drum module with 40 ready-to-play kits, 385 drum sounds, and rack stand.",
                categoryId: catMap["musical instruments"],
                subcategory: "Electronic Drum Kit",
                condition: "EXCELLENT",
                images: ["https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?w=800&auto=format&fit=crop&q=80"],
                exchangePreferences: [
                    { categoryId: catMap["musical instruments"], subcategory: "Electric Guitar", priority: 1 }
                ]
            },
            {
                ownerId: vikram._id,
                title: "Shure SM7B Vocal Studio Microphone",
                description: "Legendary Shure SM7B cardioid dynamic vocal microphone. Clean flat frequency response for broadcast, podcasting, and studio vocal tracking.",
                categoryId: catMap["musical instruments"],
                subcategory: "Studio Microphone",
                condition: "LIKE_NEW",
                images: ["https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800&auto=format&fit=crop&q=80"],
                exchangePreferences: [
                    { categoryId: catMap["electronics & tech"], subcategory: "Headphones", priority: 1 }
                ]
            },
            {
                ownerId: vikram._id,
                title: "Boss Katana 50 MkII Combo Guitar Amplifier",
                description: "50-watt combo amp with custom 12-inch speaker. 5 unique amp characters, 60+ built-in Boss effects, and USB audio output for direct recording.",
                categoryId: catMap["musical instruments"],
                subcategory: "Guitar Amplifier",
                condition: "EXCELLENT",
                images: ["https://images.unsplash.com/photo-1543443374-b6fe10a6ab7b?w=800&auto=format&fit=crop&q=80"],
                exchangePreferences: [
                    { categoryId: catMap["musical instruments"], subcategory: "Electric Guitar", priority: 1 }
                ]
            },
            {
                ownerId: vikram._id,
                title: "Bowflex SelectTech 552 Adjustable Kettlebell",
                description: "Adjusts from 8 to 40 lbs with the turn of a dial. Replaces 6 kettlebells in one compact design.",
                categoryId: catMap["sports & fitness"],
                subcategory: "Kettlebell",
                condition: "LIKE_NEW",
                images: ["https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80"],
                exchangePreferences: [
                    { categoryId: catMap["sports & fitness"], subcategory: "Dumbbell Set", priority: 1 }
                ]
            },
            {
                ownerId: vikram._id,
                title: "Babolat Pure Drive Tennis Racquet Unstrung",
                description: "Babolat Pure Drive 300g tennis racquet. Explosive power, 100 sq in head size, 16x19 string pattern. Includes full thermal cover.",
                categoryId: catMap["sports & fitness"],
                subcategory: "Tennis Racquet",
                condition: "EXCELLENT",
                images: ["https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=800&auto=format&fit=crop&q=80"],
                exchangePreferences: [
                    { categoryId: catMap["sports & fitness"], subcategory: "Badminton Racquet", priority: 1 }
                ]
            },
            {
                ownerId: vikram._id,
                title: "IKEA Landskrona 3-Seater Leather Sofa Dark Beige",
                description: "IKEA Landskrona 3-seater sofa with tufted leather cushions and sturdy wooden legs. Soft, durable top-grain leather.",
                categoryId: catMap["furniture & home"],
                subcategory: "Sofa",
                condition: "EXCELLENT",
                images: ["https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&auto=format&fit=crop&q=80"],
                exchangePreferences: [
                    { categoryId: catMap["furniture & home"], subcategory: "Standing Desk", priority: 1 }
                ]
            },
            {
                ownerId: vikram._id,
                title: "Philips Hue Go Portable Smart Table Lamp",
                description: "Portable smart LED lamp with built-in rechargeable battery. 16 million colors, Bluetooth & Zigbee compatible.",
                categoryId: catMap["furniture & home"],
                subcategory: "Table Lamp",
                condition: "LIKE_NEW",
                images: ["https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80"],
                exchangePreferences: [
                    { categoryId: catMap["electronics & tech"], subcategory: "Bluetooth Speaker", priority: 1 }
                ]
            },
            {
                ownerId: vikram._id,
                title: "Ninja Air Fryer XL 5.5-Quart Capacity",
                description: "Ninja Air Fryer Max XL with 5.5 qt ceramic coated basket, air fry, air roast, bake, reheat, and dehydrate functions.",
                categoryId: catMap["home & kitchen appliances"],
                subcategory: "Air Fryer",
                condition: "LIKE_NEW",
                images: ["https://images.unsplash.com/photo-1585515320310-259814833e62?w=800&auto=format&fit=crop&q=80"],
                exchangePreferences: [
                    { categoryId: catMap["home & kitchen appliances"], subcategory: "Robot Vacuum", priority: 1 }
                ]
            },
            {
                ownerId: vikram._id,
                title: "DEWALT 108-Piece Mechanics Hand Tool Kit",
                description: "DEWALT 108-piece mechanic socket tool set in durable blow molded case. DirectTorque technology sockets for anti-slippage.",
                categoryId: catMap["tools & diy"],
                subcategory: "Hand Tool Kit",
                condition: "EXCELLENT",
                images: ["https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80"],
                exchangePreferences: [
                    { categoryId: catMap["tools & diy"], subcategory: "Cordless Power Drill", priority: 1 }
                ]
            },
            {
                ownerId: vikram._id,
                title: "Handmade Wooden Staunton Tournament Chess Set",
                description: "Weighted Staunton No. 5 wooden chess pieces (King height 3.75 in) with folding mahogany and maple wooden board.",
                categoryId: catMap["hobbies, toys & collectibles"],
                subcategory: "Chess Set",
                condition: "LIKE_NEW",
                images: ["https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=800&auto=format&fit=crop&q=80"],
                exchangePreferences: [
                    { categoryId: catMap["hobbies, toys & collectibles"], subcategory: "Strategy Board Game", priority: 1 }
                ]
            },
            {
                ownerId: vikram._id,
                title: "Winsor & Newton Professional Acrylic Paint Studio Set",
                description: "24x 21ml tubes of high pigment artist quality acrylic paints with 5 synthetic brushes and wooden tabletop easel.",
                categoryId: catMap["hobbies, toys & collectibles"],
                subcategory: "Acrylic Paint Set",
                condition: "LIKE_NEW",
                images: ["https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&auto=format&fit=crop&q=80"],
                exchangePreferences: [
                    { categoryId: catMap["books & literature"], subcategory: "Fiction Novel", priority: 1 }
                ]
            },
            {
                ownerId: vikram._id,
                title: "Specialized Turbo Vado 3.0 Electric Bicycle",
                description: "Specialized Turbo Vado E-Bike with 250W motor, 468Wh battery, Shimano 9-speed drivetrain, integrated front & rear lights.",
                categoryId: catMap["vehicles & mobility"],
                subcategory: "Electric Bicycle",
                condition: "EXCELLENT",
                images: ["https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800&auto=format&fit=crop&q=80"],
                exchangePreferences: [
                    { categoryId: catMap["sports & fitness"], subcategory: "Mountain Bike", priority: 1 }
                ]
            },

            // --- RAHUL'S ITEMS (16 UNIQUE ITEMS) ---
            {
                ownerId: rahul._id,
                title: "Rubber Hex Dumbbell Set 20kg Pair with Rack",
                description: "Pair of 10kg heavy duty rubber hex dumbbells (total 20kg) with ergonomic chrome handles and compact steel floor rack.",
                categoryId: catMap["sports & fitness"],
                subcategory: "Dumbbell Set",
                condition: "EXCELLENT",
                images: ["https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&auto=format&fit=crop&q=80"],
                exchangePreferences: [
                    { categoryId: catMap["electronics & tech"], subcategory: "DSLR Camera", priority: 1 },
                    { categoryId: catMap["electronics & tech"], subcategory: "Smartphone", priority: 2 }
                ]
            },
            {
                ownerId: rahul._id,
                title: "Herman Miller Style Ergonomic Mesh Chair",
                description: "High back ergonomic mesh office chair with adjustable lumbar support, 3D armrests, dynamic tilt mechanism, and breathable mesh.",
                categoryId: catMap["furniture & home"],
                subcategory: "Ergonomic Mesh Chair",
                condition: "LIKE_NEW",
                images: ["https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&auto=format&fit=crop&q=80"],
                exchangePreferences: [
                    { categoryId: catMap["electronics & tech"], subcategory: "Headphones", priority: 1 }
                ]
            },
            {
                ownerId: rahul._id,
                title: "PlayStation 5 Disc Edition Console",
                description: "Sony PS5 Disc Edition console in pristine condition. Includes 1 DualSense Wireless Controller, HDMI 2.1 cable, and original box.",
                categoryId: catMap["gaming & entertainment"],
                subcategory: "PlayStation 5",
                condition: "LIKE_NEW",
                images: ["https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800&auto=format&fit=crop&q=80"],
                exchangePreferences: [
                    { categoryId: catMap["electronics & tech"], subcategory: "MacBook", priority: 1 }
                ]
            },
            {
                ownerId: rahul._id,
                title: "Cosco English Willow Cricket Bat Full Size",
                description: "Professional grade English Willow cricket bat with short cane handle, thick edges, sweet spot profile, and protective toe guard.",
                categoryId: catMap["sports & fitness"],
                subcategory: "Cricket Bat",
                condition: "GOOD",
                images: ["https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&auto=format&fit=crop&q=80"],
                exchangePreferences: [
                    { categoryId: catMap["sports & fitness"], subcategory: "Badminton Racquet", priority: 1 }
                ]
            },
            {
                ownerId: rahul._id,
                title: "Yonex Astrox 88D Pro Badminton Racquet",
                description: "Yonex Astrox 88D Pro head-heavy racquet for steep power attacks. 4U weight category with Yonex full cover.",
                categoryId: catMap["sports & fitness"],
                subcategory: "Badminton Racquet",
                condition: "LIKE_NEW",
                images: ["https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&auto=format&fit=crop&q=80"],
                exchangePreferences: [
                    { categoryId: catMap["sports & fitness"], subcategory: "Dumbbell Set", priority: 1 }
                ]
            },
            {
                ownerId: rahul._id,
                title: "Quechua 3-Person Waterproof Camping Tent",
                description: "Quechua MH100 3-person waterproof camping tent. Fresh & Black patented fabric for cooling, easy pop-up assembly, tested against wind & rain.",
                categoryId: catMap["sports & fitness"],
                subcategory: "Camping Tent",
                condition: "EXCELLENT",
                images: ["https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&auto=format&fit=crop&q=80"],
                exchangePreferences: [
                    { categoryId: catMap["fashion & apparel"], subcategory: "Laptop Backpack", priority: 1 }
                ]
            },
            {
                ownerId: rahul._id,
                title: "Osprey Farpoint 40L Travel Rucksack Backpack",
                description: "Carry-on compliant Osprey Farpoint 40 travel rucksack. Padded laptop compartment, stowable harness, durable ripstop nylon construction.",
                categoryId: catMap["fashion & apparel"],
                subcategory: "Laptop Backpack",
                condition: "EXCELLENT",
                images: ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80"],
                exchangePreferences: [
                    { categoryId: catMap["sports & fitness"], subcategory: "Camping Tent", priority: 1 }
                ]
            },
            {
                ownerId: rahul._id,
                title: "Nike Air Jordan 1 Retro High Chicago",
                description: "Nike Air Jordan 1 Retro High Sneakers in classic Chicago colorway. Size US 10 / UK 9. Includes original red & black lace sets.",
                categoryId: catMap["fashion & apparel"],
                subcategory: "Sneakers",
                condition: "EXCELLENT",
                images: ["https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800&auto=format&fit=crop&q=80"],
                exchangePreferences: [
                    { categoryId: catMap["fashion & apparel"], subcategory: "Leather Jacket", priority: 1 }
                ]
            },
            {
                ownerId: rahul._id,
                title: "Nike ZoomX Vaporfly NEXT% 2 Running Shoes",
                description: "Nike ZoomX Vaporfly marathoning running shoes in Electric Green. Size US 10. Carbon fiber plate for maximum energy return.",
                categoryId: catMap["fashion & apparel"],
                subcategory: "Running Shoes",
                condition: "LIKE_NEW",
                images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80"],
                exchangePreferences: [
                    { categoryId: catMap["fashion & apparel"], subcategory: "Sneakers", priority: 1 }
                ]
            },
            {
                ownerId: rahul._id,
                title: "Catan Strategy Board Game 5th Edition",
                description: "Catan strategy board game. Includes resource hexes, development cards, dice, and wooden player pieces. Great for game nights!",
                categoryId: catMap["hobbies, toys & collectibles"],
                subcategory: "Strategy Board Game",
                condition: "EXCELLENT",
                images: ["https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=800&auto=format&fit=crop&q=80"],
                exchangePreferences: [
                    { categoryId: catMap["books & literature"], subcategory: "Fiction Novel", priority: 1 }
                ]
            },
            {
                ownerId: rahul._id,
                title: "Wooden Ergonomic Standing Study Desk",
                description: "Teak finish solid wooden study table with motorized dual-motor height adjustment from 70cm to 120cm. Cable management tray included.",
                categoryId: catMap["furniture & home"],
                subcategory: "Standing Desk",
                condition: "LIKE_NEW",
                images: ["https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800&auto=format&fit=crop&q=80"],
                exchangePreferences: [
                    { categoryId: catMap["furniture & home"], subcategory: "Ergonomic Mesh Chair", priority: 1 }
                ]
            },
            {
                ownerId: rahul._id,
                title: "Tan Genuine Leather Biker Jacket Size M",
                description: "100% genuine lambskin tan leather motorcycle jacket with YKK metal zippers, quilted satin lining, and internal stash pockets.",
                categoryId: catMap["fashion & apparel"],
                subcategory: "Leather Jacket",
                condition: "LIKE_NEW",
                images: ["https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&auto=format&fit=crop&q=80"],
                exchangePreferences: [
                    { categoryId: catMap["fashion & apparel"], subcategory: "Sneakers", priority: 1 }
                ]
            },
            {
                ownerId: rahul._id,
                title: "Nintendo Switch OLED Model White",
                description: "Nintendo Switch OLED console with 7-inch vivid OLED screen, wide adjustable stand, 64GB internal storage, enhanced audio, and white Joy-Cons.",
                categoryId: catMap["gaming & entertainment"],
                subcategory: "Nintendo Switch",
                condition: "LIKE_NEW",
                images: ["https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=800&auto=format&fit=crop&q=80"],
                exchangePreferences: [
                    { categoryId: catMap["electronics & tech"], subcategory: "iPad", priority: 1 }
                ]
            },
            {
                ownerId: rahul._id,
                title: "Xiaomi Robot Vacuum Mop 2 Pro",
                description: "LDS Laser Navigation smart robot vacuum cleaner & mop. 3000Pa strong suction, high-frequency sonic vibration mopping, app controlled.",
                categoryId: catMap["home & kitchen appliances"],
                subcategory: "Robot Vacuum",
                condition: "EXCELLENT",
                images: ["https://images.unsplash.com/photo-1558317374-067fb5f30001?w=800&auto=format&fit=crop&q=80"],
                exchangePreferences: [
                    { categoryId: catMap["home & kitchen appliances"], subcategory: "Air Fryer", priority: 1 }
                ]
            },
            {
                ownerId: rahul._id,
                title: "Introduction to Algorithms 4th Ed CLRS Book",
                description: "Hardcover 4th Edition of Introduction to Algorithms by Cormen, Leiserson, Rivest, and Stein. Pristine condition with zero markings.",
                categoryId: catMap["books & literature"],
                subcategory: "Computer Science Book",
                condition: "LIKE_NEW",
                images: ["https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800&auto=format&fit=crop&q=80"],
                exchangePreferences: [
                    { categoryId: catMap["books & literature"], subcategory: "Entrance Exam Guide", priority: 1 }
                ]
            },
            {
                ownerId: rahul._id,
                title: "Bosch Cordless Power Drill Set 18V Kit",
                description: "Bosch Professional 18V Cordless Impact Drill with 2x 2.0Ah lithium-ion battery packs, fast charger, 41-piece screwdriver bit set, and hard case.",
                categoryId: catMap["tools & diy"],
                subcategory: "Cordless Power Drill",
                condition: "EXCELLENT",
                images: ["https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&auto=format&fit=crop&q=80"],
                exchangePreferences: [
                    { categoryId: catMap["tools & diy"], subcategory: "Hand Tool Kit", priority: 1 }
                ]
            }
        ];

        const createdItems = await Item.insertMany(itemsData);
        console.log(`✅ Seeded ${createdItems.length} 100% unique real barter items across active users`);

        // 5. Create Sample Exchange Requests
        const exchangeRequestsData = [
            {
                requesterId: alex._id,
                receiverId: vikram._id,
                offeredItemId: createdItems[0]._id, // Alex's Camera
                requestedItemId: createdItems[17]._id, // Vikram's Guitar
                status: "PENDING",
                note: "Hi Vikram! I'd love to swap my Canon 200D DSLR for your Yamaha Acoustic Guitar. Both are in excellent shape!"
            },
            {
                requesterId: rahul._id,
                receiverId: alex._id,
                offeredItemId: createdItems[34]._id, // Rahul's Dumbbells
                requestedItemId: createdItems[1]._id, // Alex's Headphones
                status: "ACCEPTED",
                note: "Hey Alex! Offering my 20kg dumbbell set for your Sony XM4 headphones."
            }
        ];

        const createdRequests = await ExchangeRequest.insertMany(exchangeRequestsData);
        console.log(`✅ Seeded ${createdRequests.length} sample exchange requests`);

        // 6. Create Sample Review
        const reviewData = {
            exchangeRequestId: createdRequests[1]._id,
            reviewerId: rahul._id,
            revieweeId: alex._id,
            rating: 5,
            comment: "Fantastic swap experience with Alex! The Sony XM4 headphones were in mint condition as described."
        };

        await Review.create(reviewData);
        console.log(`✅ Seeded sample review`);

        console.log("\n==========================================");
        console.log("🎉 SWAPSPHERE DATABASE SEEDED SUCCESSFULLY!");
        console.log("==========================================");
        console.log("11 Distinct Categories Seeded!");
        console.log("Vehicles & Mobility and Tools & DIY split into distinct categories!");
        console.log("==========================================\n");

        process.exit(0);
    } catch (error) {
        console.error("❌ Seeding Error:", error);
        process.exit(1);
    }
}

seedAll();
