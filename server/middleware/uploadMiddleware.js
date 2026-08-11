const multer = require("multer");
const cloudinary = require("../utils/cloudinary");

const storage = multer.memoryStorage();

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

const uploadToCloudinary = (fileBuffer, folder = "swapsphere") => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: folder, resource_type: "auto" },
            (error, result) => {
                if (error) return reject(error);
                resolve(result.secure_url);
            }
        );
        stream.end(fileBuffer);
    });
};

module.exports = {
    upload,
    uploadToCloudinary
};
