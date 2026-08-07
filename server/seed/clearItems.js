require("dotenv").config();

const dns = require("dns");
dns.setServers(["1.1.1.1", "8.8.8.8"]);

const mongoose = require("mongoose");

const Item = require("../models/Item");

async function clearItems() {

    try {

        await mongoose.connect(process.env.MONGO_URI);

        console.log("✅ MongoDB Connected");

        const result = await Item.deleteMany({});

        console.log(`🗑️ ${result.deletedCount} items deleted successfully`);

        await mongoose.connection.close();

        console.log("✅ Database connection closed");

        process.exit(0);

    }

    catch (error) {

        console.error("❌ Error clearing items:");

        console.error(error);

        process.exit(1);

    }

}

clearItems();