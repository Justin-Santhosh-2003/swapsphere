const User = require("../models/User");
const { uploadToCloudinary } = require("../middleware/uploadMiddleware");

exports.getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { fullName, phone, bio, location } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        if (fullName) user.fullName = fullName;
        if (phone !== undefined) user.phone = phone;
        if (bio !== undefined) user.bio = bio;
        if (location) user.location = location;

        if (req.file) {
            const imageUrl = await uploadToCloudinary(req.file.buffer, "swapsphere/profiles");
            user.profilePicture = imageUrl;
        } else if (req.body.profilePicture) {
            user.profilePicture = req.body.profilePicture;
        }

        await user.save();

        const updatedUser = await User.findById(user._id).select("-password");

        res.status(200).json({
            success: true,
            message: "Profile updated successfully.",
            user: updatedUser
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};