const router = require('express').Router();
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const { protect, asyncHandler } = require('../middleware/auth');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => (file.mimetype.startsWith('image/') ? cb(null, true) : cb(new Error('Only image files are allowed'))),
});

router.post('/', protect, upload.single('image'), asyncHandler(async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No image provided' });
  if (!process.env.CLOUDINARY_CLOUD_NAME) return res.status(500).json({ message: 'Cloudinary is not configured on the server' });
  const url = await new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder: 'event-system' }, (err, result) => (err ? reject(err) : resolve(result.secure_url)))
      .end(req.file.buffer);
  });
  res.json({ url });
}));

module.exports = router;
