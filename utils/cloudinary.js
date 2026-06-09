const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// This tells the code to use the keys from your .env file
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'rental_listings', // This creates a folder in your Cloudinary cloud
        allowed_formats: ['jpg', 'png', 'pdf'],
    },
});

const upload = multer({ storage: storage });

module.exports = upload;