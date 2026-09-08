require("dotenv").config();
const dns = require("dns");
dns.setServers(["1.1.1.1", "8.8.8.8"]);

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const User = require("../models/User");
const Item = require("../models/Item");
const Category = require("../models/Category");
const ExchangeRequest = require("../models/ExchangeRequest");
const ExchangeRoom = require("../models/ExchangeRoom");
const Review = require("../models/Review");
const Message = require("../models/Message");

// Helper to generate 35 clean distinct subcategories without "and" or "&"
function generate35Subcategories(catName, baseList) {
    const subs = new Set();
    (baseList || []).forEach(item => {
        if (!item.toLowerCase().includes(" and ") && !item.includes("&")) {
            subs.add(item);
        }
    });

    const modifiers = [
        "Pro", "Ultra", "Max", "Lite", "Compact", "Portable", "Heavy Duty", "Premium", 
        "Professional", "Standard", "Digital", "Wireless", "Vintage", "Custom", "Modular", 
        "Travel", "Slim", "Folding", "Deluxe", "Ergonomic", "Smart", "Mini", "Studio"
    ];
    const types = [
        "Kit", "Set", "Bundle", "Accessories", "Gear", "Parts", "Mounts", "Cases", 
        "Covers", "Stands", "Tools", "Editions", "Units", "Adapters", "Packs"
    ];

    let mIdx = 0;
    let tIdx = 0;
    while (subs.size < 35) {
        const mod = modifiers[mIdx % modifiers.length];
        const typ = types[tIdx % types.length];
        const candidate = `${mod} ${catName} ${typ}`;
        if (!candidate.toLowerCase().includes(" and ") && !candidate.includes("&")) {
            subs.add(candidate);
        }
        mIdx++;
        if (mIdx % modifiers.length === 0) tIdx++;
    }
    return Array.from(subs);
}

// ── 100 DISTINCT CATEGORIES (STRICTLY NO "AND" OR "&") ─────────────────────
// First 6 are popular categories featured on the homepage:
const CATEGORY_NAMES_DATA = [
    { name: "Laptops", icon: "💻", base: ["Gaming Laptops", "Ultrabooks", "Business Laptops", "Chromebooks", "MacBooks", "Convertible Laptops", "Workstation Laptops", "Budget Laptops", "Refurbished Laptops", "Laptop Bags", "Laptop Stands", "Cooling Pads", "Laptop RAM", "Laptop SSDs", "Laptop Chargers"] },
    { name: "Smartphones", icon: "📱", base: ["Android Flagships", "Android Budget", "iPhones", "Foldable Phones", "Gaming Phones", "Rugged Phones", "Feature Phones", "Phone Cases", "Screen Protectors", "Phone Mounts", "Wireless Chargers", "Fast Chargers", "Phone Wallets"] },
    { name: "Cameras", icon: "📷", base: ["DSLR Cameras", "Mirrorless Cameras", "Point Shoot Cameras", "Action Cameras", "Instant Cameras", "Film Cameras", "360 Cameras", "Drone Cameras", "Camera Lenses", "Camera Bags", "Camera Straps", "Tripods"] },
    { name: "Gaming Consoles", icon: "🎮", base: ["PlayStation 5", "PlayStation 4", "Xbox Series X", "Xbox One", "Nintendo Switch", "Nintendo Switch Lite", "Steam Deck", "Retro Consoles", "Gaming Controllers", "Arcade Sticks", "Console Stands"] },
    { name: "Apparel", icon: "👔", base: ["Formal Shirts", "Casual Shirts", "T-Shirts", "Polo Shirts", "Jeans", "Chinos", "Trousers", "Shorts", "Ethnic Kurtas", "Sherwanis", "Blazers", "Suits", "Waistcoats", "Dresses", "Skirts"] },
    { name: "Novels", icon: "📖", base: ["Mystery Thrillers", "Science Fiction", "Fantasy", "Literary Fiction", "Historical Fiction", "Romance Novels", "Horror Novels", "Crime Fiction", "Adventure Novels", "Young Adult Fiction"] },

    // Remaining 94 distinct categories (total 100):
    { name: "Tablets", icon: "📲", base: ["iPad Pro", "iPad Air", "iPad Mini", "Android Tablets", "Windows Tablets", "E-Readers", "Drawing Tablets", "Kids Tablets", "Tablet Cases", "Tablet Keyboards", "Tablet Stylus"] },
    { name: "Headphones", icon: "🎧", base: ["Over-Ear Wireless", "Over-Ear Wired", "In-Ear Wireless", "Gaming Headsets", "Studio Headphones", "Noise-Cancelling Headphones", "Open-Back Headphones", "Sports Earbuds"] },
    { name: "PC Games", icon: "🕹️", base: ["Action Games", "RPG Games", "FPS Games", "Strategy Games", "Simulation Games", "Horror Games", "Sports Games", "Racing Games", "Puzzle Games", "Indie Games"] },
    { name: "Smartwatches", icon: "⌚", base: ["Apple Watch Series", "Samsung Galaxy Watch", "Garmin Sports Watch", "Fitbit Trackers", "Fossil Smartwatch", "Budget Smartwatches", "Rugged Smartwatches"] },
    { name: "Televisions", icon: "📺", base: ["OLED TVs", "QLED TVs", "LED TVs", "Smart TVs Android", "Smart TVs Tizen", "4K TVs", "8K TVs", "Portable TVs", "Projector Screens", "Gaming TVs"] },
    { name: "Monitors", icon: "🖥️", base: ["Gaming Monitors 144Hz", "Gaming Monitors 240Hz", "4K Monitors", "Ultrawide Monitors", "Curved Monitors", "Portable Monitors", "Professional Color Monitors"] },
    { name: "Printers", icon: "🖨️", base: ["Inkjet Printers", "Laser Printers", "Photo Printers", "All-in-One Printers", "Portable Printers", "Label Printers", "Receipt Printers", "3D Printers"] },
    { name: "Textbooks", icon: "📚", base: ["Engineering Textbooks", "Medical Textbooks", "Law Textbooks", "MBA Textbooks", "Computer Science Books", "Mathematics Books", "Physics Books", "Chemistry Books"] },
    { name: "Comics", icon: "💥", base: ["Marvel Comics", "DC Comics", "Dark Horse Comics", "Image Comics", "Manga Volumes", "Manhwa Collections", "Indie Comics", "Classic Comics"] },
    { name: "Vinyl Records", icon: "🎵", base: ["Classic Rock Vinyl", "Jazz Vinyl", "Blues Vinyl", "Classical Music Vinyl", "Pop Vinyl", "Hip-Hop Vinyl", "Electronic Vinyl", "Punk Vinyl"] },
    { name: "Sneakers", icon: "👟", base: ["Nike Sneakers", "Adidas Sneakers", "Jordan Retros", "New Balance", "Puma Sneakers", "Reebok Classic", "Converse Chuck Taylor", "Vans Skate Shoes"] },
    { name: "Watches", icon: "🕰️", base: ["Mechanical Watches", "Automatic Watches", "Quartz Watches", "Dress Watches", "Sports Watches", "Dive Watches", "Pilot Watches", "Field Watches"] },
    { name: "Bags", icon: "👜", base: ["Backpacks Casual", "Backpacks Travel", "Laptop Backpacks", "Hiking Backpacks", "Handbags Women", "Clutch Bags", "Tote Bags", "Sling Bags"] },
    { name: "Cycling", icon: "🚴", base: ["Road Bikes", "Mountain Bikes", "Hybrid Bikes", "BMX Bikes", "City Bikes", "Folding Bikes", "Electric Bicycles", "Kids Bikes"] },
    { name: "Gym Equipment", icon: "🏋️", base: ["Dumbbells", "Barbells", "Kettlebells", "Weight Plates", "Olympic Bars", "Resistance Bands", "Pull-Up Bars", "Push-Up Bars"] },
    { name: "Cricket Gear", icon: "🏏", base: ["Cricket Bats English Willow", "Cricket Bats Kashmir Willow", "Junior Cricket Bats", "Cricket Batting Pads", "Cricket Gloves", "Cricket Helmets"] },
    { name: "Football Gear", icon: "⚽", base: ["Match Footballs", "Training Footballs", "Indoor Footballs", "Football Boots Firm Ground", "Football Boots Soft Ground", "Goalkeeper Gloves"] },
    { name: "Badminton Gear", icon: "🏸", base: ["Badminton Rackets Professional", "Badminton Rackets Intermediate", "Carbon Fiber Rackets", "Shuttlecocks Feather", "Shuttlecocks Nylon"] },
    { name: "Outdoor Camping", icon: "⛺", base: ["Tents 1-Person", "Tents 2-Person", "Family Tents", "Backpacking Tents", "Sleeping Bags 0C", "Sleeping Bags -10C", "Sleeping Pads"] },
    { name: "Kitchen Appliances", icon: "🍳", base: ["Mixer Grinders", "Blenders", "Juicers", "Air Fryers", "Microwave Ovens", "OTG Ovens", "Electric Kettles", "Coffee Makers"] },
    { name: "Furniture", icon: "🪑", base: ["Study Desks", "Gaming Desks", "Standing Desks", "Office Chairs", "Gaming Chairs", "Bean Bags", "Sofas", "Recliners"] },
    { name: "Home Decor", icon: "🏺", base: ["Wall Art Prints", "Canvas Paintings", "Posters", "Wall Clocks", "Photo Frames", "Mirrors Decorative", "Candles Scented"] },
    { name: "Musical Instruments", icon: "🎸", base: ["Acoustic Guitars", "Electric Guitars", "Bass Guitars", "Classical Guitars", "Guitar Amplifiers", "Guitar Pedals Effects", "Ukuleles"] },
    { name: "Board Games", icon: "♟️", base: ["Strategy Board Games", "Party Board Games", "Cooperative Games", "Word Games", "Trivia Games", "Abstract Games", "Deck Building Games"] },
    { name: "Electric Scooters", icon: "🛵", base: ["Budget E-Scooters", "Mid-Range E-Scooters", "Long Range E-Scooters", "Off-Road E-Scooters", "Seated E-Scooters", "Kids E-Scooters"] },
    { name: "Art Supplies", icon: "🎨", base: ["Acrylic Paints", "Oil Paints", "Watercolor Paints", "Gouache Paints", "Pastel Sets", "Colored Pencils", "Drawing Pencils HB"] },
    { name: "Skincare", icon: "✨", base: ["Face Serums Vitamin C", "Hyaluronic Acid Serums", "Retinol Creams", "Niacinamide Serums", "Face Moisturizers", "Night Creams"] },
    { name: "Haircare", icon: "💇", base: ["Shampoos Strengthening", "Shampoos Anti-Dandruff", "Conditioners Deep", "Hair Masks", "Hair Oils Argan", "Hair Serums"] },
    { name: "Perfumes", icon: "🌸", base: ["Men Eau de Toilette", "Men Eau de Parfum", "Women Eau de Parfum", "Women Eau de Toilette", "Unisex Fragrances", "Oriental Fragrances"] },
    { name: "Makeup", icon: "💄", base: ["Foundations", "Concealers", "Primers", "Setting Powders", "Setting Sprays", "Blushes", "Bronzers Highlighters"] },
    { name: "Yoga", icon: "🧘", base: ["Yoga Mats Premium", "Yoga Mats Travel", "Yoga Blocks Foam", "Yoga Blocks Cork", "Yoga Straps", "Yoga Bolsters"] },
    { name: "Science Kits", icon: "🔬", base: ["Chemistry Experiment Kits", "Biology Microscope Kits", "Physics Experiment Kits", "Robotics Beginner Kits", "Arduino Starter Kits"] },
    { name: "Action Figures", icon: "🦸", base: ["Marvel Legends Figures", "DC Multiverse Figures", "Star Wars Figures", "Hot Wheels Diecast", "Transformers", "Funko Pop Vinyls"] },
    { name: "Photography Gear", icon: "🌄", base: ["Prime Lenses 50mm", "Wide Angle Lenses", "Telephoto Lenses", "Macro Lenses", "Fisheye Lenses", "Tilt Shift Lenses"] },
    { name: "Audio Speakers", icon: "🔊", base: ["Portable Bluetooth Speakers", "Home Theater Systems", "Soundbars", "Subwoofers", "Bookshelf Speakers", "Floor Standing Speakers"] },
    { name: "Smart Home", icon: "🏠", base: ["Smart Speakers Echo", "Smart Speakers Google", "Smart Bulbs Color", "Smart Bulbs White", "Smart Plugs", "Smart Power Strips"] },
    { name: "Storage Drives", icon: "💾", base: ["External HDD 1TB", "External HDD 2TB", "External HDD 4TB", "Portable SSD", "Desktop SSD", "NVMe SSDs"] },
    { name: "Power Banks", icon: "🔋", base: ["10000mAh Power Banks", "20000mAh Power Banks", "Fast Charge Power Banks", "Wireless Power Banks", "Solar Power Banks"] },
    { name: "Networking Routers", icon: "📡", base: ["WiFi Routers Dual Band", "WiFi Routers Tri Band", "Mesh WiFi Systems", "WiFi Range Extenders", "Network Switches 8-Port"] },
    { name: "Software Licenses", icon: "💿", base: ["Windows OS Keys", "Microsoft Office Licenses", "Adobe Creative Cloud", "Antivirus Software", "VPN Subscriptions"] },
    { name: "Cookware", icon: "🍴", base: ["Non-Stick Frying Pans", "Stainless Steel Pans", "Cast Iron Skillets", "Woks", "Saucepans", "Stock Pots"] },
    { name: "Office Stationery", icon: "✏️", base: ["Fountain Pens", "Ballpoint Pens", "Gel Pens", "Rollerball Pens", "Brush Pens Calligraphy", "Highlighters"] },
    { name: "Gardening Tools", icon: "🌱", base: ["Vegetable Seeds", "Flower Seeds", "Herb Seeds", "Succulent Seeds", "Seed Starting Trays", "Potting Soil"] },
    { name: "Pet Supplies", icon: "🐾", base: ["Dog Food Dry", "Dog Food Wet", "Dog Treats", "Dog Toys Chew", "Dog Leashes", "Dog Collars"] },
    { name: "RC Toy Cars", icon: "🚗", base: ["RC Cars Electric", "RC Cars Nitro", "RC Monster Trucks", "RC Rock Crawlers", "RC Drift Cars", "RC Boats"] },
    { name: "Drones", icon: "🚁", base: ["DJI Mini Series", "DJI Air Series", "DJI Mavic Pro", "DJI Phantom", "Autel Drones", "FPV Racing Drones"] },
    { name: "VR Headsets", icon: "🥽", base: ["Meta Quest 2", "Meta Quest 3", "PlayStation VR2", "PC VR Headsets", "Standalone VR Headsets", "VR Controllers"] },
    { name: "Bedding Accessories", icon: "🛏️", base: ["Memory Foam Pillows", "Latex Pillows", "Cooling Pillows", "Body Pillows", "Pillow Protectors"] },
    { name: "Jewelry", icon: "💍", base: ["Gold Necklaces", "Silver Necklaces", "Pearl Necklaces", "Pendant Necklaces", "Chain Necklaces", "Gold Rings"] },
    { name: "Sunglasses", icon: "🕶️", base: ["Aviator Sunglasses", "Wayfarer Sunglasses", "Cat Eye Sunglasses", "Round Sunglasses", "Rectangular Sunglasses"] },
    { name: "Umbrellas", icon: "☂️", base: ["Compact Folding Umbrellas", "Large Golf Umbrellas", "Windproof Umbrellas", "Automatic Open Umbrellas"] },
    { name: "Water Sports", icon: "🏄", base: ["Surfboards Shortboard", "Surfboards Longboard", "Bodyboards Boogie Boards", "SUP Stand Up Paddleboards"] },
    { name: "Fitness Trackers", icon: "📊", base: ["Fitbit Charge", "Fitbit Luxe", "Xiaomi Mi Bands", "Samsung Fit", "Garmin Vivosmart"] },
    { name: "Baby Gear", icon: "🍼", base: ["Strollers Full Size", "Lightweight Strollers", "Jogging Strollers", "Travel System Strollers"] },
    { name: "Hand Tools", icon: "🔧", base: ["Wire Strippers", "Crimping Tools", "Screwdriver Sets", "Socket Wrench Sets", "Allen Key Sets"] },
    { name: "Power Tools", icon: "⚡", base: ["Cordless Drills", "Drill Bits Sets", "Circular Saws", "Jigsaws", "Angle Grinders"] },
    { name: "Cookbooks", icon: "📔", base: ["Indian Cuisine Cookbooks", "Italian Cuisine Cookbooks", "French Cuisine Cookbooks", "Japanese Cuisine Cookbooks"] },
    { name: "Language Books", icon: "🌍", base: ["English Grammar Books", "IELTS Preparation Books", "TOEFL Books", "Hindi Learning Books"] },
    { name: "Magic Tricks", icon: "🪄", base: ["Beginner Magic Kits", "Card Magic Sets", "Coin Magic Sets", "Close-Up Magic Props"] },
    { name: "Candles", icon: "🕯️", base: ["Soy Wax Candles", "Beeswax Candles", "Paraffin Candles", "Coconut Wax Candles"] },
    { name: "Maps Atlases", icon: "🗺️", base: ["World Wall Maps", "India Maps Detailed", "City Maps Framed", "Road Maps Folded"] },
    { name: "Puzzles", icon: "🧩", base: ["500 Piece Jigsaws", "1000 Piece Jigsaws", "1500 Piece Jigsaws", "2000 Piece Jigsaws"] },
    { name: "Swimming Accessories", icon: "🏊", base: ["Competitive Swimsuits", "Recreational Swimwear", "Bikinis Swimwear", "Swim Trunks Men"] },
    { name: "Archery Gear", icon: "🏹", base: ["Recurve Bows", "Compound Bows", "Longbows", "Traditional Bows", "Youth Bows"] },
    { name: "Climbing Equipment", icon: "🧗", base: ["Climbing Ropes Dynamic", "Climbing Ropes Static", "Climbing Harnesses", "Climbing Shoes"] },
    { name: "Martial Arts Gear", icon: "🥋", base: ["Karate Gi", "Judo Gi", "BJJ Gi", "MMA Shorts", "Boxing Gloves Training"] },
    { name: "Golf Clubs", icon: "⛳", base: ["Golf Drivers", "Golf Fairway Woods", "Golf Hybrids", "Golf Irons Sets", "Golf Wedges"] },
    { name: "Anime Merchandise", icon: "🌸", base: ["Anime Posters", "Anime Canvas Prints", "Anime Figurines PVC", "Anime Plush Toys"] },
    { name: "Indoor Plants", icon: "🌿", base: ["Pothos Plants", "Snake Plants", "Peace Lily Plants", "Spider Plants", "ZZ Plants"] },
    { name: "Telescopes", icon: "🔭", base: ["Refractor Telescopes", "Reflector Newtonian Telescopes", "Dobsonian Telescopes"] },
    { name: "Health Monitors", icon: "🩺", base: ["Digital Blood Pressure Monitors", "Pulse Oximeters Fingertip", "Digital Thermometers"] },
    { name: "Scarves", icon: "🧣", base: ["Silk Scarves Women", "Wool Scarves Men", "Cashmere Shawls", "Cotton Stoles"] },
    { name: "Travel Essentials", icon: "✈️", base: ["Universal Travel Adapters", "Power Strip Travel", "Travel Plugs", "Luggage Locks TSA"] },
    { name: "Architecture Models", icon: "🏗️", base: ["Foam Board Sheets", "Balsa Wood Sheets", "Acrylic Sheets Clear", "Precision Knives"] },
    { name: "Collectibles", icon: "🏆", base: ["Sports Trading Cards", "Pokemon Cards Packs", "Yu-Gi-Oh Cards", "Rare Coins Indian"] },
    { name: "Microscopes", icon: "🔬", base: ["Student Microscopes", "Digital USB Microscopes", "Binocular Compound Microscopes"] },
    { name: "Projectors", icon: "📹", base: ["4K Home Theater Projectors", "Portable Mini Projectors", "Short Throw Projectors"] },
    { name: "E-Readers", icon: "📖", base: ["Kindle Paperwhite", "Kindle Oasis", "Kobo Clara", "Onyx Boox E-Ink Tablet"] },
    { name: "Tableware", icon: "🍽️", base: ["Ceramic Dinnerware Sets", "Glassware Sets", "Cutlery Sets Stainless"] },
    { name: "Baking Tools", icon: "🧁", base: ["Silicon Baking Molds", "Rolling Pins Wood", "Pastry Bags Tips"] },
    { name: "Party Supplies", icon: "🎉", base: ["Foil Balloons Sets", "Party Photo Props", "LED Party Lights"] },
    { name: "Sewing Machines", icon: "🧵", base: ["Electric Sewing Machines", "Heavy Duty Sewing Machines", "Embroidery Machines"] },
    { name: "Lighting Fixtures", icon: "💡", base: ["Modern Chandelier", "Pendant Ceiling Light", "Minimalist Wall Sconces"] },
    { name: "Hardware Tools", icon: "🛠️", base: ["Heavy Duty Vice Clamps", "Workbench Tables", "Tool Chest Cabinets"] },
    { name: "Bicycles", icon: "🚲", base: ["Hybrid City Bicycles", "Single Speed Bicycles", "Folding Commuter Bikes"] },
    { name: "Trekking Gear", icon: "🏞️", base: ["Trekking Backpacks 60L", "Trekking Poles Carbon", "Waterproof Gaiters"] },
    { name: "Fishing Tackle", icon: "🎣", base: ["Spinning Fishing Rods", "Baitcasting Reels", "Fishing Lures Kit"] },
    { name: "Billiards Gear", icon: "🎱", base: ["Pool Cue Sticks", "Billiard Ball Sets", "Triangle Rack Hardwood"] },
    { name: "Skateboards", icon: "🛹", base: ["Complete Skateboard Decks", "Longboards Cruiser", "Penny Skateboard 22\""] },
    { name: "Luggage Suitcases", icon: "🧳", base: ["Hard Shell Carry-On", "Check-In Luggage 28\"", "Rolling Duffel Luggage"] },
    { name: "Wireless Audio", icon: "🎙️", base: ["Wireless Lapel Mics", "Studio Condenser Mic", "Podcast Mic Boom Arm"] },
    { name: "Fitness Wearables", icon: "🏃", base: ["Heart Rate Chest Straps", "Smart Fitness Rings", "GPS Running Band"] },
    { name: "Musical Keyboards", icon: "🎹", base: ["Synthesizer Keyboards", "MIDI Keyboard 61-Key", "Arranger Keyboards"] },
    { name: "Camera Lenses", icon: "🔍", base: ["50mm F1.8 Prime Lens", "24-70mm F2.8 Zoom Lens", "70-200mm Telephoto Lens"] }
];

// High quality exact-match Unsplash images
const ITEM_IMAGE_MAP = {
    "MacBook Pro 16-inch M2": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80",
    "Dell XPS 15 Gaming Laptop": "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80",
    "Sony Alpha A7 IV Mirrorless Camera": "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80",
    "Canon EOS R6 Mark II": "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=800&q=80",
    "iPhone 14 Pro Max 256GB": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80",
    "Samsung Galaxy S23 Ultra 5G": "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=800&q=80",
    "Computer Science Algorithm Textbook Set": "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80",
    "Engineering Mathematics & Physics Bundle": "https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=800&q=80",
    "The Ordinary Skincare Routine Bundle": "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80",
    "Paula's Choice BHA Exfoliant Set": "https://images.unsplash.com/photo-1608248597261-8332586b3235?auto=format&fit=crop&w=800&q=80",
    "Naruto Shippuden Collector Statue Box": "https://images.unsplash.com/photo-1608889825205-eebdb9fc5806?auto=format&fit=crop&w=800&q=80",
    "Attack on Titan Scout Regiment Outfit": "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80",
    "Lamy Safari Fountain Pen Set": "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=800&q=80",
    "Anker 26800mAh Fast Power Bank": "https://images.unsplash.com/photo-1609592424074-95a64a78c1df?auto=format&fit=crop&w=800&q=80",
    "LG 27-inch 4K UHD IPS Monitor": "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80",
    "Marshall Stanmore II Bluetooth Speaker": "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80",
    "Meta Quest 2 128GB VR Headset": "https://images.unsplash.com/photo-1622979135225-d2ba269bc1bd?auto=format&fit=crop&w=800&q=80",
    "PC Physical Collectors Edition Bundle": "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80",
    "Japanese N5 to N3 Learning Bundle": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80",
    "Bosch 18V Cordless Drill & Impact Driver": "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=800&q=80",
    "Sennheiser HD 660S Open-Back Headphones": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
    "Sony WH-1000XM5 ANC Headphones": "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80",
    "PlayStation 5 Disc Edition Bundle": "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=800&q=80",
    "Nintendo Switch OLED Model White": "https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?auto=format&fit=crop&w=800&q=80",
    "Classic Fantasy Hardcover Series": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80",
    "Stephen King Horror Novel Collection": "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80",
    "Pink Floyd & Beatles Vinyl Album Set": "https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=800&q=80",
    "Miles Davis Kind of Blue LP": "https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&w=800&q=80",
    "Ergonomic Mesh Executive Chair": "https://images.unsplash.com/photo-1580481072645-022f9a6d8310?auto=format&fit=crop&w=800&q=80",
    "Solid Teak Wood L-Shaped Study Desk": "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=800&q=80",
    "Catan + Seafarers Expansion Set": "https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?auto=format&fit=crop&w=800&q=80",
    "Wingspan Board Game + European Expansion": "https://images.unsplash.com/photo-1606167668584-78701c57f13d?auto=format&fit=crop&w=800&q=80",
    "Google Nest Hub Max 10-inch Display": "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=800&q=80",
    "Godox AD200 Pro Pocket Flash Kit": "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80",
    "Celestron AstroMaster 130EQ Telescope": "https://images.unsplash.com/photo-1516339901601-2e1b62dc0c45?auto=format&fit=crop&w=800&q=80",
    "Indian Vintage Stamp & Coin Collection": "https://images.unsplash.com/photo-1533038590840-1cde6e668a91?auto=format&fit=crop&w=800&q=80",
    "Samsung T7 1TB Portable External SSD": "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=800&q=80",
    "ASUS Gaming WiFi 6 Router (RT-AX88U)": "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80",
    "DJI Mini 3 Pro Drone Fly More Combo": "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=800&q=80",
    "Garmin Forerunner 255 GPS Running Watch": "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80",
    "Bowflex SelectTech 552 Adjustable Dumbbells": "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=800&q=80",
    "Olympic Barbell 20kg + 100kg Bumper Plates": "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=800&q=80",
    "Apple Watch Ultra 49mm Titanium": "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80",
    "Samsung Galaxy Watch 5 Pro": "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80",
    "Nike Air Jordan 1 Retro High Chicago": "https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=800&q=80",
    "Adidas Yeezy Boost 350 V2 Zebra": "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=800&q=80",
    "Ottolenghi Cookbook Hardcover Trilogy": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80",
    "Gordon Ramsay Masterclass Cookbooks x3": "https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=800&q=80",
    "SS Ton Reserve Edition English Willow Bat": "https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=800&q=80",
    "Kookaburra Pro Players Cricket Protection Kit": "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=800&q=80",
    "Tom Ford Oud Wood EDP 100ml": "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80",
    "Bleu de Chanel Parfum 100ml": "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=800&q=80",
    "Winsor & Newton Artist Oil Paint Set": "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=800&q=80",
    "Elegoo UNO R3 Project Smart Robot Car": "https://images.unsplash.com/photo-1563770660941-20978e870e26?auto=format&fit=crop&w=800&q=80",
    "Venum Challenger 3.0 Boxing Gloves & Pads": "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&w=800&q=80",
    "Speedo Fastskin Racing Swimsuit & Goggles": "https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=800&q=80",
    "Manduka PRO 6mm Heavy Duty Yoga Mat": "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?auto=format&fit=crop&w=800&q=80",
    "Omron Upper Arm Blood Pressure Monitor": "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80",
    "Black Diamond Rock Climbing Harness Set": "https://images.unsplash.com/photo-1522163182402-834f871fd851?auto=format&fit=crop&w=800&q=80",
    "Inflatable Kayak 2-Person Set": "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80",
    "Yamaha P-125 88-Key Digital Piano": "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?auto=format&fit=crop&w=800&q=80",
    "Fender Player Stratocaster Electric Guitar": "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=800&q=80",
    "Trek FX 3 Disc Hybrid Bicycle": "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=800&q=80",
    "Giant Escape 2 City Disc Bike": "https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?auto=format&fit=crop&w=800&q=80",
    "DeWalt 20V MAX Cordless Combo Kit": "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=800&q=80",
    "Makita 18V Cordless Circular Saw": "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&w=800&q=80",
    "Modern Metal Wall Art Sculpture Set": "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80",
    "Large Handcrafted Macrame Tapestry": "https://images.unsplash.com/photo-1584589167171-541ce45f1eea?auto=format&fit=crop&w=800&q=80",
    "Nike Phantom GX Elite FG Football Boots": "https://images.unsplash.com/photo-1511886929837-354d827aae26?auto=format&fit=crop&w=800&q=80",
    "Adidas Match Football & Goalkeeper Gloves": "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=800&q=80",
    "Hot Toys Iron Man Mark L 1/6 Figure": "https://images.unsplash.com/photo-1608889825205-eebdb9fc5806?auto=format&fit=crop&w=800&q=80",
    "Marvel Legends Avengers Action Figure Set": "https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=800&q=80",
    "DJI Mavic Air 2 Fly More Combo": "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=800&q=80",
    "Yonex Astrox 88D Pro Badminton Racket": "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=800&q=80",
    "Fiddle Leaf Fig Tree 5ft Tall": "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=800&q=80",
    "Ray-Ban Aviator Classic Polarized RB3025": "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80",
    "TaylorMade Stealth 2 Driver 10.5 Degree": "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&w=800&q=80",
    "Samick Sage 62-inch Takedown Recurve Bow": "https://images.unsplash.com/photo-1513477742901-6e87b631cfd4?auto=format&fit=crop&w=800&q=80",
    "Automatic Self-Cleaning Cat Litter Box": "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80",
    "Le Creuset Enameled Cast Iron Dutch Oven": "https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=800&q=80",
    "Celestron NexStar 6SE Schmidt-Cassegrain": "https://images.unsplash.com/photo-1516339901601-2e1b62dc0c45?auto=format&fit=crop&w=800&q=80",
    "Sky-Watcher Virtuoso GT 150p Tabletop": "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=800&q=80",
    "Liforme Original Yoga Mat with Alignment": "https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=800&q=80",
    "Gaiam Yoga Block Set & Cotton Strap Bundle": "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80",
    "Apple Watch Series 9 45mm GPS": "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80",
    "Samsung Galaxy Watch 6 Classic 47mm": "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80",
    "Monstera Deliciosa Swiss Cheese Plant": "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=800&q=80",
    "Variegated Snake Plant & Peace Lily Set": "https://images.unsplash.com/photo-1599598425947-020645068694?auto=format&fit=crop&w=800&q=80",
    "Li-Ning N90 IV Professional Badminton Racket": "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=800&q=80",
    "Victor Thruster F Claw Badminton Racket": "https://images.unsplash.com/photo-1521537634581-0ddea2efe2b6?auto=format&fit=crop&w=800&q=80",
    "Charlotte Tilbury Pillow Talk Makeup Box": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80",
    "NARS Orgasm Blush & Bronzer Palette": "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80",
    "Jo Malone Wood Sage & Sea Salt Candle": "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80",
    "Burberry Classic Check Cashmere Scarf": "https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?auto=format&fit=crop&w=800&q=80",
    "Samsonite Omni PC Hardside Luggage": "https://images.unsplash.com/photo-1565026057447-ba90a3d07d6b?auto=format&fit=crop&w=800&q=80",
    "Ravensburger 2000 Piece World Map Jigsaw": "https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?auto=format&fit=crop&w=800&q=80",
    "Bugaboo Fox 3 All-Terrain Stroller": "https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=800&q=80",
    "Bicycle Gaff Deck & Magic Book Bundle": "https://images.unsplash.com/photo-1511893311914-0346f16efe90?auto=format&fit=crop&w=800&q=80",
    "Pokemon TCG Base Set Charizard Holo": "https://images.unsplash.com/photo-1613771404784-3a5686aa2be3?auto=format&fit=crop&w=800&q=80",
    "De'Longhi Dedica Espresso Machine & Grinder": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80"
};

const CATEGORY_FALLBACK_IMAGES = {
    "Laptops": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80",
    "Smartphones": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80",
    "Cameras": "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80",
    "Gaming Consoles": "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=800&q=80",
    "Apparel": "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=800&q=80",
    "Novels": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80",
    "Headphones": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
    "Tablets": "https://images.unsplash.com/photo-1561154464-82e9adf32764?auto=format&fit=crop&w=800&q=80",
    "Smartwatches": "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80",
    "Monitors": "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80",
    "Drones": "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=800&q=80",
    "Gym Equipment": "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=800&q=80",
    "Cycling": "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=800&q=80",
    "Sneakers": "https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=800&q=80",
    "Watches": "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80",
    "Musical Instruments": "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=800&q=80",
    "Furniture": "https://images.unsplash.com/photo-1580481072645-022f9a6d8310?auto=format&fit=crop&w=800&q=80",
    "Home Decor": "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80",
    "Indoor Plants": "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=800&q=80",
    "Cricket Gear": "https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=800&q=80",
    "Football Gear": "https://images.unsplash.com/photo-1511886929837-354d827aae26?auto=format&fit=crop&w=800&q=80",
    "Badminton Gear": "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=800&q=80",
    "Perfumes": "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80",
    "Skincare": "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80",
    "Makeup": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80",
    "Action Figures": "https://images.unsplash.com/photo-1608889825205-eebdb9fc5806?auto=format&fit=crop&w=800&q=80",
    "Board Games": "https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?auto=format&fit=crop&w=800&q=80",
    "Yoga": "https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=800&q=80",
    "Power Tools": "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=800&q=80"
};

async function runSeed() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected to MongoDB");

        // 1. Wipe collections
        console.log("🗑️  Wiping database collections...");
        await Promise.all([
            User.deleteMany({}),
            Item.deleteMany({}),
            Category.deleteMany({}),
            ExchangeRequest.deleteMany({}),
            ExchangeRoom.deleteMany({}),
            Review.deleteMany({}),
            Message.deleteMany({})
        ]);
        console.log("✨ All existing collections wiped!");

        // 2. Build and insert 100 distinct categories with 35 subcategories each
        console.log("📂 Constructing 100 DISTINCT categories (NO 'and' / '&'), each with 35 subcategories...");
        const categoriesToInsert = CATEGORY_NAMES_DATA.map(c => ({
            name: c.name,
            icon: c.icon,
            description: `${c.name} equipment, items, and accessories for barter.`,
            subcategories: generate35Subcategories(c.name, c.base)
        }));

        const insertedCategories = await Category.insertMany(categoriesToInsert);
        console.log(`✅ ${insertedCategories.length} 100% distinct categories created in MongoDB!`);

        const catMap = {};
        insertedCategories.forEach(cat => {
            catMap[cat.name] = cat;
        });

        // 3. Create 5 test users
        console.log("👤 Creating 5 test users (password: test123)...");
        const hashedPassword = await bcrypt.hash("test123", 10);
        const locations = ["Mumbai", "Delhi", "Bangalore", "Chennai", "Hyderabad"];

        const usersData = [1, 2, 3, 4, 5].map((num, i) => ({
            fullName: `Test User ${num}`,
            email: `testUser${num}@example.com`,
            password: hashedPassword,
            location: locations[i],
            bio: `Hello! I am Test User ${num}. Excited to swap items on SwapSphere.`,
            totalCompletedExchanges: 0,
            totalCancelledExchanges: 0,
            averageRating: 0,
            exchangeSuccessRate: 0,
            role: "USER",
            status: "ACTIVE"
        }));

        const insertedUsers = await User.insertMany(usersData);
        console.log(`✅ ${insertedUsers.length} users created successfully.`);
        const [u1, u2, u3, u4, u5] = insertedUsers;

        // 4. Create 150 items (30 per user) with matching high-quality photos
        console.log("📦 Creating 150 item listings (30 per user) with high-res matching Unsplash photos & match-ready preferences...");

        const conditions = ["LIKE_NEW", "EXCELLENT", "GOOD", "FAIR"];
        const getRand = (arr) => arr[Math.floor(Math.random() * arr.length)];

        const getItemImage = (title, catName) => {
            if (ITEM_IMAGE_MAP[title]) return ITEM_IMAGE_MAP[title];
            if (CATEGORY_FALLBACK_IMAGES[catName]) return CATEGORY_FALLBACK_IMAGES[catName];
            return `https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80`;
        };

        // Note: exchangePreferences store { categoryId: pc._id } without overly restricting subcategory
        // so preferenceMatches(itemA, itemB) evaluates to TRUE for items in category pc!
        const createItem = (owner, catName, title, desc, prefCatNames) => {
            const cat = catMap[catName];
            if (!cat) throw new Error(`Category not found: ${catName}`);
            const subcategory = cat.subcategories[Math.floor(Math.random() * cat.subcategories.length)];
            const exchangePreferences = prefCatNames.map(pcn => {
                const pc = catMap[pcn];
                if (!pc) throw new Error(`Pref category not found: ${pcn}`);
                return { categoryId: pc._id };
            });

            return {
                ownerId: owner._id,
                title,
                description: desc,
                categoryId: cat._id,
                subcategory,
                condition: getRand(conditions),
                images: [getItemImage(title, catName)],
                exchangePreferences,
                status: "AVAILABLE"
            };
        };

        const listingsData = [
            // ── Test User 1 (30 items) ───────────────────────────────────────
            // 2-Way Matches:
            // u1(Laptops) ↔ u2(Headphones)
            createItem(u1, "Laptops", "MacBook Pro 16-inch M2", "Apple M2 Pro chip, 16GB RAM, 512GB SSD. Pristine condition with box.", ["Headphones", "Gaming Consoles", "Vinyl Records"]),
            createItem(u1, "Laptops", "Dell XPS 15 Gaming Laptop", "Intel i7 12th Gen, RTX 3060, 16GB RAM. Great for gaming and editing.", ["Headphones", "Novels"]),
            // u1(Cameras) ↔ u3(Gym Equipment)
            createItem(u1, "Cameras", "Sony Alpha A7 IV Mirrorless Camera", "Full-frame 33MP sensor, 4K 60p video. Low shutter count, immaculate body.", ["Gym Equipment", "Smartwatches"]),
            createItem(u1, "Cameras", "Canon EOS R6 Mark II", "24.2MP full frame camera with RF 24-105mm kit lens. Barely used.", ["Gym Equipment", "Sneakers"]),
            // u1(Smartphones) ↔ u5(Smartwatches)
            createItem(u1, "Smartphones", "iPhone 14 Pro Max 256GB", "Deep Purple, 95% battery health. Screen protector and MagSafe case.", ["Smartwatches", "Telescopes"]),
            createItem(u1, "Smartphones", "Samsung Galaxy S23 Ultra 5G", "Phantom Black, 12GB RAM, 512GB storage. Includes S-Pen.", ["Smartwatches", "Yoga"]),

            // 3-Way Rings:
            // Ring A-a: u1(Textbooks) → u2(Vinyl Records) → u3(Cookbooks) → u1
            createItem(u1, "Textbooks", "Computer Science Algorithm Textbook Set", "CLRS 3rd Ed, SICP, Tanenbaum Networks. All hardcovers in great shape.", ["Vinyl Records"]),
            createItem(u1, "Textbooks", "Engineering Mathematics & Physics Bundle", "Higher Engineering Math by B.S. Grewal + Resnick Halliday Physics.", ["Vinyl Records"]),
            // Ring D-a: u1(Skincare) → u3(Perfumes) → u5(Makeup) → u1
            createItem(u1, "Skincare", "The Ordinary Skincare Routine Bundle", "Niacinamide, Hyaluronic Acid, Vitamin C, AHA Peeling Solution.", ["Perfumes"]),
            createItem(u1, "Skincare", "Paula's Choice BHA Exfoliant Set", "2% BHA Liquid Exfoliant 118ml + Hydrating Cleanser.", ["Perfumes"]),
            // Ring E-c: u1(Anime Merchandise) → u2(Board Games) → u4(Action Figures) → u1
            createItem(u1, "Anime Merchandise", "Naruto Shippuden Collector Statue Box", "1/6 scale Naruto vs Sasuke statue, art prints, headband.", ["Board Games"]),
            createItem(u1, "Anime Merchandise", "Attack on Titan Scout Regiment Outfit", "Complete cosplay set with cloak, harness, and Levi figure.", ["Board Games"]),

            // General u1 items with preferences for other users' categories:
            createItem(u1, "Office Stationery", "Lamy Safari Fountain Pen Set", "Set of 3 Lamy Safari pens with extra nibs and ink cartridges.", ["Cookbooks", "Musical Instruments"]),
            createItem(u1, "Power Banks", "Anker 26800mAh Fast Power Bank", "Triple USB output, PD quick charging. Includes travel pouch.", ["Smart Home", "Novels"]),
            createItem(u1, "Monitors", "LG 27-inch 4K UHD IPS Monitor", "HDR 400, USB-C 60W power delivery, height adjustable stand.", ["Gaming Consoles", "Headphones"]),
            createItem(u1, "Audio Speakers", "Marshall Stanmore II Bluetooth Speaker", "Classic vintage design, 80W output, deep bass.", ["Cycling", "Football Gear"]),
            createItem(u1, "VR Headsets", "Meta Quest 2 128GB VR Headset", "Includes Touch controllers, elite strap, 10 VR games preloaded.", ["Drones", "Action Figures"]),
            createItem(u1, "PC Games", "PC Physical Collectors Edition Bundle", "RDR2, Cyberpunk 2077, Witcher 3 steelbooks + map guides.", ["Musical Instruments", "Board Games"]),
            createItem(u1, "Language Books", "Japanese N5 to N3 Learning Bundle", "Genki I & II, Kanji Look and Learn, JLPT practice workbooks.", ["Puzzles", "Textbooks"]),
            createItem(u1, "Power Tools", "Bosch 18V Cordless Drill & Impact Driver", "Dual tool combo kit with 2 batteries, charger, and hard case.", ["Art Supplies", "Furniture"]),
            createItem(u1, "Tablets", "iPad Pro 12.9 M2 WiFi 256GB", "Liquid Retina XDR display, M2 chip, Space Grey, Apple Pencil 2 support.", ["Apparel", "Novels"]),
            createItem(u1, "Apparel", "Men Leather Biker Jacket Genuine", "Lambskin leather, black, size L. Worn twice.", ["Smartphones", "Sneakers"]),
            createItem(u1, "Gaming Consoles", "Xbox Series X 1TB Console", "Like new in box with 1 Xbox Wireless Controller.", ["Laptops", "Smartwatches"]),
            createItem(u1, "Smartwatches", "Apple Watch Series 8 45mm GPS", "Midnight Aluminum, sports band, battery health 96%.", ["Cameras", "Headphones"]),
            createItem(u1, "Sunglasses", "Ray-Ban Wayfarer Classic Polarized", "Black frame, original case & cleaning cloth.", ["Apparel", "Watches"]),
            createItem(u1, "Bags", "Herschel Little America Backpack 25L", "Navy Blue canvas, padded laptop sleeve, magnetic strap closures.", ["Sneakers", "Cycling"]),
            createItem(u1, "Sneakers", "Nike Air Force 1 '07 Triple White", "Size US 10, worn once indoors, crisp white condition.", ["Apparel", "Cycling"]),
            createItem(u1, "Home Decor", "Minimalist Table Lamp Nordic Design", "Warm LED bulb, matte black finish, touch dimmer.", ["Furniture", "Indoor Plants"]),

            createItem(u1, "Furniture", "Ergonomic Standing Desk Converter", "Gas spring height adjustment, dual monitor platform.", ["Laptops", "Monitors"]),
            createItem(u1, "Cookware", "Stainless Steel Tri-Ply Cookware Set", "5-piece induction compatible pot and pan set with glass lids.", ["Kitchen Appliances", "Cookbooks"]),

            // ── Test User 2 (30 items) ───────────────────────────────────────
            // 2-Way Matches:
            // u2(Headphones) ↔ u1(Laptops)
            createItem(u2, "Headphones", "Sennheiser HD 660S Open-Back Headphones", "Audiophile reference headphones. Includes 4.4mm balanced cable.", ["Laptops", "Cameras"]),
            createItem(u2, "Headphones", "Sony WH-1000XM5 ANC Headphones", "Black, 30hr battery life, industry leading noise cancellation.", ["Laptops", "Smartphones"]),
            // u2(Gaming Consoles) ↔ u3(Smartwatches)
            createItem(u2, "Gaming Consoles", "PlayStation 5 Disc Edition Bundle", "Includes 2 DualSense controllers and God of War Ragnarok.", ["Smartwatches", "Gym Equipment"]),
            createItem(u2, "Gaming Consoles", "Nintendo Switch OLED Model White", "OLED screen, 64GB storage, carrying case, Mario Kart 8.", ["Smartwatches", "Sneakers"]),
            // u2(Novels) ↔ u4(Musical Instruments)
            createItem(u2, "Novels", "Classic Fantasy Hardcover Series", "Lord of the Rings 3-book boxset, Hobbit, Silmarillion.", ["Musical Instruments", "Cycling"]),
            createItem(u2, "Novels", "Stephen King Horror Novel Collection", "The Shining, IT, Carrie, Misery, Stand. All paperback first prints.", ["Musical Instruments", "Power Tools"]),

            // 3-Way Rings:
            // Ring A-b: u2(Vinyl Records) → u3(Cookbooks) → u1(Textbooks) → u2
            createItem(u2, "Vinyl Records", "Pink Floyd & Beatles Vinyl Album Set", "Dark Side of the Moon, Abbey Road, Sgt Pepper 180g vinyls.", ["Cookbooks"]),
            createItem(u2, "Vinyl Records", "Miles Davis Kind of Blue LP", "Original Jazz pressings, anti-static inner sleeves.", ["Cookbooks"]),
            // Ring B-a: u2(Furniture) → u4(Home Decor) → u5(Indoor Plants) → u2
            createItem(u2, "Furniture", "Ergonomic Mesh Executive Chair", "High back mesh, adjustable lumbar support, 3D armrests.", ["Home Decor"]),
            createItem(u2, "Furniture", "Solid Teak Wood L-Shaped Study Desk", "140cm study desk with cable management tray and drawers.", ["Home Decor"]),
            // Ring E-a: u2(Board Games) → u4(Action Figures) → u1(Anime Merchandise) → u2
            createItem(u2, "Board Games", "Catan + Seafarers Expansion Set", "Base game + 5-6 player extension + Seafarers expansion.", ["Action Figures"]),
            createItem(u2, "Board Games", "Wingspan Board Game + European Expansion", "Engine-building board game with custom wooden dice tower.", ["Action Figures"]),

            // General u2 items:
            createItem(u2, "Smart Home", "Google Nest Hub Max 10-inch Display", "Smart home controller with built-in camera and stereo speakers.", ["Power Banks", "Monitors"]),
            createItem(u2, "Photography Gear", "Godox AD200 Pro Pocket Flash Kit", "200Ws TTL battery strobe with bare bulb and Fresnel head.", ["Cameras", "Laptops"]),
            createItem(u2, "Telescopes", "Celestron AstroMaster 130EQ Telescope", "Reflector telescope with German Equatorial mount and eyepieces.", ["Science Kits", "Drones"]),
            createItem(u2, "Collectibles", "Indian Vintage Stamp & Coin Collection", "Rare 1948 independence stamps + vintage copper coins.", ["Vinyl Records", "Novels"]),
            createItem(u2, "Storage Drives", "Samsung T7 1TB Portable External SSD", "USB 3.2 Gen 2, up to 1050MB/s transfer speed, aluminum body.", ["Monitors", "Laptops"]),
            createItem(u2, "Networking Routers", "ASUS Gaming WiFi 6 Router (RT-AX88U)", "Dual-band WiFi 6, 8 Gigabit LAN ports, AiMesh compatible.", ["Laptops", "Monitors"]),

            createItem(u2, "Drones", "DJI Mini 3 Pro Drone Fly More Combo", "Under 249g, 4K/60fps video, 3 batteries, RC controller.", ["Telescopes", "Cameras"]),
            createItem(u2, "Fitness Trackers", "Garmin Forerunner 255 GPS Running Watch", "Slate Grey, multi-band GPS, HR monitor, triathlon features.", ["Smartwatches", "Sneakers"]),
            createItem(u2, "Laptops", "Asus Zephyrus G14 Gaming Laptop", "Ryzen 7, RTX 3060, 16GB RAM, Moonlight White.", ["Headphones", "Cameras"]),
            createItem(u2, "Apparel", "Women Designer Wool Winter Coat", "Beige trench coat, cashmere blend, size M.", ["Bags", "Sneakers"]),
            createItem(u2, "Smartphones", "Google Pixel 7 Pro 128GB Hazel", "Tensor G2 processor, pro camera system, unlocked.", ["Laptops", "Cameras"]),
            createItem(u2, "Cameras", "Fujifilm X-T4 Mirrorless Camera Body", "26.1MP APS-C sensor, IBIS, Silver finish.", ["Laptops", "Gym Equipment"]),
            createItem(u2, "Novels", "Harry Potter Illustrated Hardcover 1-5", "Full color illustrated editions by Jim Kay.", ["Novels", "Textbooks"]),
            createItem(u2, "Gym Equipment", "Adjustable Kettlebell 8-40lbs", "Cast iron quick select weight dial.", ["Cycling", "Sneakers"]),
            createItem(u2, "Kitchen Appliances", "Philips Digital Air Fryer XL 6.2L", "Rapid Air technology, touchscreen preset menu.", ["Furniture", "Cookware"]),
            createItem(u2, "Watches", "Seiko 5 Sports Automatic Watch", "Navy blue dial, stainless steel bracelet, 100m water resistance.", ["Apparel", "Sunglasses"]),
            createItem(u2, "Outdoor Camping", "Coleman 4-Person Instant Cabin Tent", "Sets up in 60 seconds, weatherproof rainfly.", ["Cycling", "Trekking Gear"]),
            createItem(u2, "Pet Supplies", "Cat Scratching Tree 54-inch Tower", "Multi-level sisal posts, plush condo, hanging toys.", ["Furniture", "Home Decor"]),

            // ── Test User 3 (30 items) ───────────────────────────────────────
            // 2-Way Matches:
            // u3(Gym Equipment) ↔ u1(Cameras)
            createItem(u3, "Gym Equipment", "Bowflex SelectTech 552 Adjustable Dumbbells", "Pair of adjustable dumbbells from 5lbs to 52.5lbs each.", ["Cameras", "Laptops"]),
            createItem(u3, "Gym Equipment", "Olympic Barbell 20kg + 100kg Bumper Plates", "7ft chrome Olympic bar with rubberized bumper plate set.", ["Cameras", "Smartphones"]),
            // u3(Smartwatches) ↔ u2(Gaming Consoles)
            createItem(u3, "Smartwatches", "Apple Watch Ultra 49mm Titanium", "Cellular, Sapphire Crystal, Alpine Loop band. 98% battery.", ["Gaming Consoles", "Headphones"]),
            createItem(u3, "Smartwatches", "Samsung Galaxy Watch 5 Pro", "45mm Black Titanium, Sapphire glass, D-Buckle sport band.", ["Gaming Consoles", "Novels"]),
            // u3(Sneakers) ↔ u4(Cycling)
            createItem(u3, "Sneakers", "Nike Air Jordan 1 Retro High Chicago", "US Size 10, unworn deadstock in original box with receipt.", ["Cycling", "Football Gear"]),
            createItem(u3, "Sneakers", "Adidas Yeezy Boost 350 V2 Zebra", "UK Size 9, worn twice, immaculate upper and soles.", ["Cycling", "Badminton Gear"]),

            // 3-Way Rings:
            // Ring A-c: u3(Cookbooks) → u1(Textbooks) → u2(Vinyl Records) → u3
            createItem(u3, "Cookbooks", "Ottolenghi Cookbook Hardcover Trilogy", "SIMPLE, Plenty, and Jerusalem cookbooks. Mint condition.", ["Textbooks"]),
            createItem(u3, "Cookbooks", "Gordon Ramsay Masterclass Cookbooks x3", "Ultimate Cookery Course, Bread & Pastry, Fast Food.", ["Textbooks"]),
            // Ring C-a: u3(Cricket Gear) → u4(Football Gear) → u5(Badminton Gear) → u3
            createItem(u3, "Cricket Gear", "SS Ton Reserve Edition English Willow Bat", "Grade 1 English Willow, 2.9 lbs, pre-knocked and oiled.", ["Football Gear"]),
            createItem(u3, "Cricket Gear", "Kookaburra Pro Players Cricket Protection Kit", "Batting pads, gloves, helmet, chest guard, and kit bag.", ["Football Gear"]),
            // Ring D-b: u3(Perfumes) → u5(Makeup) → u1(Skincare) → u3
            createItem(u3, "Perfumes", "Tom Ford Oud Wood EDP 100ml", "85% bottle remaining, 100% authentic fragrance.", ["Makeup"]),
            createItem(u3, "Perfumes", "Bleu de Chanel Parfum 100ml", "90% bottle remaining with magnetic cap and box.", ["Makeup"]),

            // General u3 items:
            createItem(u3, "Art Supplies", "Winsor & Newton Artist Oil Paint Set", "24 color tubes, hog bristle brushes, wooden palette, easel.", ["Office Stationery", "Hand Tools"]),
            createItem(u3, "Science Kits", "Elegoo UNO R3 Project Smart Robot Car", "Complete STEM robotics kit with sensors, modules, instruction.", ["Telescopes", "Drones"]),
            createItem(u3, "Martial Arts Gear", "Venum Challenger 3.0 Boxing Gloves & Pads", "14oz leather gloves, curved focus mitts, hand wraps.", ["Gym Equipment", "Cycling"]),
            createItem(u3, "Swimming Accessories", "Speedo Fastskin Racing Swimsuit & Goggles", "Fina approved suit, mirrored anti-fog competition goggles.", ["Sneakers", "Badminton Gear"]),
            createItem(u3, "Yoga", "Manduka PRO 6mm Heavy Duty Yoga Mat", "Black Sage color, slip resistant polyurethane surface.", ["Cycling", "Power Tools"]),
            createItem(u3, "Health Monitors", "Omron Upper Arm Blood Pressure Monitor", "Digital BP cuff with Bluetooth syncing to smartphone app.", ["Fitness Trackers", "Smartwatches"]),
            createItem(u3, "Climbing Equipment", "Black Diamond Rock Climbing Harness Set", "Medium harness, chalk bag, 2 screwgate carabiners, ATC device.", ["Outdoor Camping", "Bags"]),

            createItem(u3, "Water Sports", "Inflatable Kayak 2-Person Set", "Includes 2 aluminum paddles, high-pressure pump, carry bag.", ["Cycling", "Outdoor Camping"]),
            createItem(u3, "Headphones", "Bose QuietComfort Earbuds II", "Triple black, customizable fit kit, noise cancellation.", ["Smartphones", "Laptops"]),
            createItem(u3, "Smartphones", "OnePlus 11 5G 256GB Eternal Green", "Snapdragon 8 Gen 2, 100W SUPERVOOC charging.", ["Laptops", "Smartwatches"]),
            createItem(u3, "Bags", "Women Designer Leather Handbag", "Genuine calfskin leather tote bag, black.", ["Apparel", "Sneakers"]),
            createItem(u3, "Cameras", "GoPro HERO 11 Black Action Camera", "5.3K 60fps video, Enduro battery, sticky mounts.", ["Outdoor Camping", "Drones"]),
            createItem(u3, "Gaming Consoles", "Steam Deck 512GB NVMe SSD Model", "Anti-glare etched glass, carrying case, 45W USB-C charger.", ["Laptops", "Monitors"]),
            createItem(u3, "Audio Speakers", "JBL Charge 5 Waterproof Bluetooth Speaker", "Powerbank feature, 20hr playtime, IP67 waterproof.", ["Outdoor Camping", "Cycling"]),
            createItem(u3, "Cycling", "Specialized Allez Road Bike 54cm", "Aluminum frame, Shimano Claris 2x8 speed.", ["Sneakers", "Gym Equipment"]),
            createItem(u3, "Musical Instruments", "Yamaha FG800 Acoustic Guitar", "Solid Sitka spruce top, nato back and sides, natural finish.", ["Novels", "Audio Speakers"]),
            createItem(u3, "Home Decor", "Handmade Wool Area Rug 5x7ft", "Geometric pattern, plush natural wool texture.", ["Furniture", "Home Decor"]),
            createItem(u3, "Hand Tools", "DeWalt Socket Wrench Set 108-Piece", "1/4\" and 3/8\" drive ratchets and metric/SAE sockets.", ["Power Tools", "Gardening Tools"]),

            // ── Test User 4 (30 items) ───────────────────────────────────────
            // 2-Way Matches:
            // u4(Musical Instruments) ↔ u2(Novels)
            createItem(u4, "Musical Instruments", "Yamaha P-125 88-Key Digital Piano", "Weighted GHS keyboard, includes stand, pedal, and bench.", ["Novels", "Vinyl Records"]),
            createItem(u4, "Musical Instruments", "Fender Player Stratocaster Electric Guitar", "Butterscotch Blonde, Maple neck, Alnico 5 single-coil pickups.", ["Novels", "Headphones"]),
            // u4(Cycling) ↔ u3(Sneakers)
            createItem(u4, "Cycling", "Trek FX 3 Disc Hybrid Bicycle", "Large frame, Shimano 2x9 drivetrain, hydraulic disc brakes.", ["Sneakers", "Cricket Gear"]),
            createItem(u4, "Cycling", "Giant Escape 2 City Disc Bike", "Medium frame, integrated rack and mudguards, puncture-proof tires.", ["Sneakers", "Gym Equipment"]),
            // u4(Power Tools) ↔ u5(Yoga)
            createItem(u4, "Power Tools", "DeWalt 20V MAX Cordless Combo Kit", "Drill/driver, impact driver, 2 Ah batteries, charger, kit bag.", ["Yoga", "Telescopes"]),
            createItem(u4, "Power Tools", "Makita 18V Cordless Circular Saw", "6-1/2 inch blade, brushless motor, light weight.", ["Yoga", "Indoor Plants"]),

            // 3-Way Rings:
            // Ring B-b: u4(Home Decor) → u5(Indoor Plants) → u2(Furniture) → u4
            createItem(u4, "Home Decor", "Modern Metal Wall Art Sculpture Set", "3-piece geometric metal wall art, gold and black finish.", ["Indoor Plants"]),
            createItem(u4, "Home Decor", "Large Handcrafted Macrame Tapestry", "100cm wide woven bohemian wall hanging with wooden dowel.", ["Indoor Plants"]),
            // Ring C-b: u4(Football Gear) → u5(Badminton Gear) → u3(Cricket Gear) → u4
            createItem(u4, "Football Gear", "Nike Phantom GX Elite FG Football Boots", "UK Size 9, Gripknit upper, tri-star studs, carrying sack.", ["Badminton Gear"]),
            createItem(u4, "Football Gear", "Adidas Match Football & Goalkeeper Gloves", "FIFA Quality Pro match ball + Predator Pro goalkeeper gloves.", ["Badminton Gear"]),
            // Ring E-b: u4(Action Figures) → u1(Anime Merchandise) → u2(Board Games) → u4
            createItem(u4, "Action Figures", "Hot Toys Iron Man Mark L 1/6 Figure", "Diecast 1/6 scale figure with LED light-up features and stand.", ["Anime Merchandise"]),
            createItem(u4, "Action Figures", "Marvel Legends Avengers Action Figure Set", "6 figures: Cap, Thor, Iron Man, Spider-Man, Hulk, Widow.", ["Anime Merchandise"]),

            // General u4 items:
            createItem(u4, "Drones", "DJI Mavic Air 2 Fly More Combo", "4K/60fps video, 48MP photos, 34-min flight time, ND filters.", ["Telescopes", "Cameras"]),
            createItem(u4, "Badminton Gear", "Yonex Astrox 88D Pro Badminton Racket", "4U-G5 grip, strung with Yonex BG66 Ultimax at 27lbs.", ["Cricket Gear", "Sneakers"]),
            createItem(u4, "Indoor Plants", "Fiddle Leaf Fig Tree 5ft Tall", "Healthy lush green leaves in ceramic planter pot.", ["Home Decor", "Furniture"]),
            createItem(u4, "Sunglasses", "Ray-Ban Aviator Classic Polarized RB3025", "Gold frame, G-15 green polarized lenses, leather case.", ["Watches", "Apparel"]),
            createItem(u4, "Golf Clubs", "TaylorMade Stealth 2 Driver 10.5 Degree", "Graphite regular shaft, headcover and adjustment wrench.", ["Cycling", "Gym Equipment"]),
            createItem(u4, "Archery Gear", "Samick Sage 62-inch Takedown Recurve Bow", "35lb draw weight, includes 6 carbon arrows and arm guard.", ["Outdoor Camping", "Climbing Equipment"]),
            createItem(u4, "Pet Supplies", "Automatic Self-Cleaning Cat Litter Box", "Smart sensor technology, odor removal filter, smartphone app.", ["Novels", "Home Decor"]),
            createItem(u4, "Cookware", "Le Creuset Enameled Cast Iron Dutch Oven", "5.5 qt round Dutch oven in Marseille Blue, flawless enamel.", ["Cookbooks", "Kitchen Appliances"]),
            createItem(u4, "Laptops", "Microsoft Surface Pro 9 i7 16GB", "13-inch PixelSense display, Platinum, Signature Keyboard.", ["Laptops", "Monitors"]),
            createItem(u4, "Smartphones", "Xiaomi 13 Pro 5G 256GB Leica Camera", "1-inch Sony IMX989 sensor, 120W HyperCharge.", ["Smartphones", "Headphones"]),
            createItem(u4, "Apparel", "Men Formal Wool Suit Charcoal Grey", "2-piece slim fit suit, size 40R.", ["Apparel", "Watches"]),
            createItem(u4, "Cameras", "Nikon Z6 II Mirrorless Camera Body", "24.5MP BSI sensor, dual EXPEED 6 processors.", ["Cameras", "Laptops"]),
            createItem(u4, "Gaming Consoles", "Nintendo Switch Pro Controller", "Wireless official controller, Bluetooth, motion controls.", ["Gaming Consoles", "VR Headsets"]),
            createItem(u4, "Headphones", "Audio-Technica ATH-M50x Studio Headphones", "Critically acclaimed professional monitor headphones.", ["Headphones", "Audio Speakers"]),
            createItem(u4, "Smartwatches", "Fitbit Sense 2 Health Smartwatch", "Advanced health tracking, cEDA stress sensor, built-in GPS.", ["Smartwatches", "Fitness Trackers"]),
            createItem(u4, "Tablets", "Samsung Galaxy Tab S8 Ultra 14.6-inch", "Super AMOLED 120Hz display, S-Pen included.", ["Tablets", "Laptops"]),
            createItem(u4, "Furniture", "Executive Wooden Bookshelf 5-Tier", "Solid pine wood, dark walnut stain finish.", ["Furniture", "Home Decor"]),
            createItem(u4, "Kitchen Appliances", "Breville Barista Touch Espresso Machine", "Automated touchscreen coffee machine with microfoam milk steam wand.", ["Kitchen Appliances", "Cookware"]),

            // ── Test User 5 (30 items) ───────────────────────────────────────
            // 2-Way Matches:
            // u5(Telescopes) ↔ u4(Drones)
            createItem(u5, "Telescopes", "Celestron NexStar 6SE Schmidt-Cassegrain", "GoTo computerised tracking mount, StarPointer finderscope.", ["Drones", "Cameras"]),
            createItem(u5, "Telescopes", "Sky-Watcher Virtuoso GT 150p Tabletop", "WiFi app-controlled tabletop Dobsonian telescope.", ["Drones", "Science Kits"]),
            // u5(Yoga) ↔ u4(Power Tools)
            createItem(u5, "Yoga", "Liforme Original Yoga Mat with Alignment", "Eco-friendly non-slip grip surface, 4.2mm thickness.", ["Power Tools", "Gym Equipment"]),
            createItem(u5, "Yoga", "Gaiam Yoga Block Set & Cotton Strap Bundle", "2 high-density foam blocks + 8ft stretch strap.", ["Power Tools", "Cycling"]),
            // u5(Smartwatches) ↔ u1(Smartphones)
            createItem(u5, "Smartwatches", "Apple Watch Series 9 45mm GPS", "Midnight Aluminum, S9 SiP chip, Double Tap gesture feature.", ["Smartphones", "Laptops"]),
            createItem(u5, "Smartwatches", "Samsung Galaxy Watch 6 Classic 47mm", "Rotating bezel, Silver stainless steel, BIA body analysis.", ["Smartphones", "Headphones"]),

            // 3-Way Rings:
            // Ring B-c: u5(Indoor Plants) → u2(Furniture) → u4(Home Decor) → u5
            createItem(u5, "Indoor Plants", "Monstera Deliciosa Swiss Cheese Plant", "Mature 4ft plant with multi-fenestrated split leaves.", ["Furniture"]),
            createItem(u5, "Indoor Plants", "Variegated Snake Plant & Peace Lily Set", "Pair of air-purifying low-maintenance indoor plants in pots.", ["Furniture"]),
            // Ring C-c: u5(Badminton Gear) → u3(Cricket Gear) → u4(Football Gear) → u5
            createItem(u5, "Badminton Gear", "Li-Ning N90 IV Professional Badminton Racket", "Dynamic-Optimum frame, strung at 28lbs, full cover bag.", ["Cricket Gear"]),
            createItem(u5, "Badminton Gear", "Victor Thruster F Claw Badminton Racket", "3U-G5 grip, extra stiff shaft for heavy smashes.", ["Cricket Gear"]),
            // Ring D-c: u5(Makeup) → u1(Skincare) → u3(Perfumes) → u5
            createItem(u5, "Makeup", "Charlotte Tilbury Pillow Talk Makeup Box", "Lipstick, liner, blush palette, eyeshadow quad. Brand new in box.", ["Skincare"]),
            createItem(u5, "Makeup", "NARS Orgasm Blush & Bronzer Palette", "Iconic blush/bronzer Duo + setting powder. Lightly swatched.", ["Skincare"]),

            // General u5 items:
            createItem(u5, "Candles", "Jo Malone Wood Sage & Sea Salt Candle", "200g luxury scented candle, 45 hour burn time. Gift box.", ["Home Decor", "Perfumes"]),
            createItem(u5, "Scarves", "Burberry Classic Check Cashmere Scarf", "Giant icon check in Tan/Beige 100% cashmere. Like new.", ["Apparel", "Watches"]),
            createItem(u5, "Luggage Suitcases", "Samsonite Omni PC Hardside Luggage", "28-inch spinner trolley suitcase with TSA lock.", ["Bags", "Travel Essentials"]),
            createItem(u5, "Board Games", "Ravensburger 2000 Piece World Map Jigsaw", "High quality cardboard jigsaw puzzle, 100% complete.", ["Board Games", "Puzzles"]),
            createItem(u5, "Baby Gear", "Bugaboo Fox 3 All-Terrain Stroller", "Includes bassinet and seat unit, rain cover, sun canopy.", ["Furniture", "Home Decor"]),
            createItem(u5, "Magic Tricks", "Bicycle Gaff Deck & Magic Book Bundle", "10 gimmicked Bicycle playing card decks + mentalism guide.", ["Board Games", "PC Games"]),
            createItem(u5, "Collectibles", "Pokemon TCG Base Set Charizard Holo", "Graded PSA 8 Near Mint Unlimited Edition Charizard.", ["Cricket Gear", "Action Figures"]),
            createItem(u5, "Kitchen Appliances", "De'Longhi Dedica Espresso Machine & Grinder", "15-bar pump espresso maker with stainless steel milk frother.", ["Kitchen Appliances", "Cookware"]),
            createItem(u5, "Laptops", "MacBook Air 13 M1 256GB Space Grey", "8GB RAM, 256GB SSD, battery health 92%, with charger.", ["Laptops", "Smartphones"]),
            createItem(u5, "Smartphones", "Google Pixel 6a 128GB Charcoal", "Dual camera system, Google Tensor chip, unlocked.", ["Smartphones", "Laptops"]),
            createItem(u5, "Apparel", "Women Winter Puffer Jacket Black", "Water resistant duck down puffer coat, size M.", ["Apparel", "Sneakers"]),
            createItem(u5, "Cameras", "Fujifilm X100V Digital Camera Silver", "Fixed 23mm F2 lens, hybrid viewfinder, 4K video.", ["Cameras", "Laptops"]),
            createItem(u5, "Gaming Consoles", "PlayStation VR2 Headset & Controllers", "HDR OLED display, 110-degree FOV, haptic feedback.", ["Gaming Consoles", "VR Headsets"]),
            createItem(u5, "Headphones", "AirPods Pro 2nd Gen with MagSafe Case", "USB-C charging case, active noise cancellation.", ["Headphones", "Smartphones"]),
            createItem(u5, "Monitors", "Dell UltraSharp 27-inch 4K USB-C Monitor", "IPS panel, 99% sRGB color accuracy, ergonomic stand.", ["Monitors", "Laptops"]),
            createItem(u5, "Bags", "Peak Design Everyday Backpack 20L", "Weatherproof shell, FlexFold dividers, charcoal color.", ["Bags", "Cameras"]),
            createItem(u5, "Sneakers", "New Balance 550 White Green", "Size US 9.5, worn 3 times, near deadstock condition.", ["Sneakers", "Apparel"]),
            createItem(u5, "Watches", "Tissot PRX Powermatic 80 Blue Dial", "Integrated stainless steel bracelet, 80 hour power reserve.", ["Watches", "Apparel"])
        ];

        const insertedItems = await Item.insertMany(listingsData);
        console.log(`✅ ${insertedItems.length} item listings created successfully!`);

        console.log("\n════════════════════════════════════════════════════════════════════");
        console.log("🎉 SWAPSPHERE MATCH-READY SEED COMPLETED SUCCESSFULLY!");
        console.log("════════════════════════════════════════════════════════════════════");
        console.log(`📂 Total Categories: ${insertedCategories.length} (NO 'AND' / '&')`);
        console.log(`🏷️ Subcategories:    35 per category (3,500 total subcategories)`);
        console.log(`⭐ Top 6 Featured:   Laptops, Smartphones, Cameras, Gaming Consoles, Apparel, Novels`);
        console.log(`👤 Test Users:       ${insertedUsers.length}`);
        console.log(`📦 Total Listings:   ${insertedItems.length} (30 per user)`);
        console.log("────────────────────────────────────────────────────────────────────");
        console.log("🔑 All Test Users Password: test123");
        insertedUsers.forEach(u => console.log(`   • ${u.fullName} (${u.email})`));
        console.log("════════════════════════════════════════════════════════════════════\n");

        await mongoose.connection.close();
        process.exit(0);
    } catch (err) {
        console.error("❌ Seed error:", err);
        process.exit(1);
    }
}

runSeed();
