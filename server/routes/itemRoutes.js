const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {

    createItem

} = require("../controllers/itemController");

router.post("/", protect, createItem);

module.exports = router;