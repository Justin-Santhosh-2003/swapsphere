const User = require("../models/User");

const adminOnly = async (req, res, next) => {

    try {

        const user = await User.findById(req.user.id);

        if (!user) {

            return res.status(404).json({

                success: false,
                message: "User not found."

            });

        }

        if (user.role !== "ADMIN") {

            return res.status(403).json({

                success: false,
                message: "Access denied. Admins only."

            });

        }

        next();

    }

    catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,
            message: "Server Error"

        });

    }

};

module.exports = adminOnly;