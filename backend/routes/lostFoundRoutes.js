const express = require('express');
const router = express.Router();
const lostFoundController = require('../controllers/lostFoundController');
const authMiddleware = require('../middleware/authMiddleware');
const fs = require('fs');
const multer = require('multer');

// Ensure uploads directory exists
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const userId = req.user ? req.user.id : 'unknown';
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'lostfound-' + userId + '-' + uniqueSuffix + '-' + file.originalname);
  }
});

// File filter restricting to image types
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WEBP images are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: fileFilter
});

/**
 * POST /api/lost-found-items
 * Creates a lost/found report post. Protected: any authenticated role.
 */
router.post(
  '/',
  authMiddleware,
  (req, res, next) => {
    const uploadSingle = upload.single('photo');
    uploadSingle(req, res, function (err) {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ success: false, message: 'File upload error: ' + err.message });
      } else if (err) {
        return res.status(400).json({ success: false, message: err.message });
      }
      next();
    });
  },
  lostFoundController.createLostFoundItem
);

module.exports = router;
