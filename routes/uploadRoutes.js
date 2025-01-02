import express from 'express';
import multer from 'multer';
import path from 'path';

// Set up multer for file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
  },
});

const upload = multer({ storage: storage });

const router = express.Router();

// Handle file upload request
router.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded.' });
  }

  // Respond with the uploaded file information
  res.json({
    message: 'File uploaded successfully!',
    file: req.file,
  });
});

export default router;
