require("dotenv").config();

const dns = require("dns");

dns.setServers(["1.1.1.1", "8.8.8.8"]);

const mongoose = require("mongoose");

const Item = require("../models/Item");

const itemData = require("./itemData");

async function seedItems() {

    try {

        await mongoose.connect(process.env.MONGO_URI);

        console.log("✅ MongoDB Connected");

        // Remove old demo items

        await Item.deleteMany({});

        console.log("🗑️ Old items removed");

        // Insert new items

        await Item.insertMany(itemData);

        console.log(`✅ ${itemData.length} items inserted successfully`);

        process.exit();

    }

    catch (error) {

        console.error(error);

        process.exit(1);

    }

}

seedItems();