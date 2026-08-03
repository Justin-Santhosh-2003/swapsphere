const dns = require("node:dns");

// Temporary workaround for Node.js DNS SRV resolution issue
dns.setServers(["1.1.1.1", "8.8.8.8"]);

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
// const protect = require("./middleware/authMiddleware");
const userRoutes = require("./routes/userRoutes");

const app = express();

// Connect Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

// Home Route
app.get("/", (req, res) => {
    res.send("🚀 SwapSphere Backend Running");
});

// // Temporary Protected Route (for testing JWT)
// app.get("/api/protected", protect, (req, res) => {
//     res.status(200).json({
//         success: true,
//         message: "Protected route accessed successfully.",
//         user: req.user
//     });
// });

// Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});