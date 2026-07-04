const express = require('express');
const router = express.Router();
const controller = require('./academicsController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads folder exists in backend/uploads
const uploadDir = path.join(__dirname, '../../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

// Students/Profiles
router.get('/students', controller.getStudents);
router.put('/students/:id', controller.updateStudent);

// Textbook Exchange
router.get('/textbooks', controller.getTextbooks);
router.post('/textbooks', controller.createTextbook);

// Handover Requests
router.post('/handover', controller.requestHandover);
router.get('/handover', controller.getHandoverRequests);
router.put('/handover/:id', controller.updateHandoverRequest);

// Digital Resources (Vault)
router.get('/vault', controller.getDigitalResources);
router.post('/vault', controller.createDigitalResource);

// PDF Upload Endpoint
router.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const fileUrl = `http://localhost:4000/uploads/${req.file.filename}`;
  return res.json({ url: fileUrl });
});

module.exports = router;