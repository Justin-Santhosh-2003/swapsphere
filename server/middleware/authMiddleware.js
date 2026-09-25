const jwt  = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {

    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {

        try {

            token = req.headers.authorization.split(" ")[1];

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Fetch live user record to check status (catches suspensions)
            const user = await User.findById(decoded.id).select("-password");

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: "User account not found."
                });
            }

            if (user.status === "SUSPENDED") {
                return res.status(403).json({
                    success: false,
                    message: "Your account has been suspended. Please contact support.",
                    suspended: true
                });
            }

            req.user = decoded;

            next();

        }

        catch (error) {

            return res.status(401).json({

                success: false,
                message: "Invalid token."

            });

        }

    }

    else {

        return res.status(401).json({

            success: false,
            message: "Access denied. No token provided."

        });

    }

};

module.exports = protect;