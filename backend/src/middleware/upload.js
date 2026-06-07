const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary
if (process.env.CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

let storage;

if (process.env.CLOUDINARY_CLOUD_NAME) {
  // Use Cloudinary if credentials are provided (Required for Vercel)
  storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
      const ext = path.extname(file.originalname).substring(1);
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      return {
        folder: 'pfe_annexes',
        format: ext === 'pdf' ? 'pdf' : ext, // Support PDF natively
        public_id: `annexe-${uniqueSuffix}`,
        resource_type: ext === 'pdf' ? 'raw' : 'auto' // PDF usually needs raw/auto
      };
    },
  });
} else {
  // Fallback: Use local disk storage in development if no Cloudinary keys
  const uploadsDir = path.join(__dirname, '../../uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const ext = path.extname(file.originalname);
      cb(null, `annexe-${uniqueSuffix}${ext}`);
    },
  });
}

// File filter - only allow PDFs and images
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF and image files are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50 MB limit
  },
});

module.exports = upload;
