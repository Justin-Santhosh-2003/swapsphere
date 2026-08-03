const User = require("../models/User");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const validator = require("validator");

// =============================
// Register User
// =============================

exports.register = async (req, res) => {

    try {

        const {

            fullName,
            email,
            password,
            location

        } = req.body;

        // Validate required fields

        if (!fullName || !email || !password || !location) {

            return res.status(400).json({

                success: false,
                message: "Please fill all required fields."

            });

        }

        // Validate email

        if (!validator.isEmail(email)) {

            return res.status(400).json({

                success: false,
                message: "Invalid email address."

            });

        }

        // Password length

        if (password.length < 6) {

            return res.status(400).json({

                success: false,
                message: "Password must be at least 6 characters."

            });

        }

        // Check existing user

        const existingUser = await User.findOne({ email });

        if (existingUser) {

            return res.status(400).json({

                success: false,
                message: "Email already registered."

            });

        }

        // Hash password

        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user

        const user = await User.create({

            fullName,
            email,
            password: hashedPassword,
            location

        });

        // Generate JWT

        const token = jwt.sign(

            {

                id: user._id,
                role: user.role

            },

            process.env.JWT_SECRET,

            {

                expiresIn: "7d"

            }

        );

        res.status(201).json({

            success: true,

            message: "Registration Successful",

            token,

            user: {

                id: user._id,
                fullName: user.fullName,
                email: user.email,
                location: user.location,
                role: user.role

            }

        });

    }

    catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,
            message: "Server Error"

        });

    }

};

// =============================
// Login User
// =============================

exports.login = async (req, res) => {

    try {

        const {

            email,
            password

        } = req.body;

        // Check required fields

        if (!email || !password) {

            return res.status(400).json({

                success: false,
                message: "Email and password are required."

            });

        }

        // Find user

        const user = await User.findOne({ email });

        if (!user) {

            return res.status(400).json({

                success: false,
                message: "Invalid email or password."

            });

        }

        // Compare password

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {

            return res.status(400).json({

                success: false,
                message: "Invalid email or password."

            });

        }

        // Generate JWT

        const token = jwt.sign(

            {

                id: user._id,
                role: user.role

            },

            process.env.JWT_SECRET,

            {

                expiresIn: "7d"

            }

        );

        res.status(200).json({

            success: true,

            message: "Login Successful",

            token,

            user: {

                id: user._id,
                fullName: user.fullName,
                email: user.email,
                profilePicture: user.profilePicture,
                role: user.role,
                location: user.location,
                averageRating: user.averageRating,
                exchangeSuccessRate: user.exchangeSuccessRate,
                totalCompletedExchanges: user.totalCompletedExchanges

            }

        });

    }

    catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,
            message: "Server Error"

        });

    }

};