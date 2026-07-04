const express = require('express');
const router = express.Router();
const multer = require('multer');
const printController = require('./print.controller');

// ⚙️ Configure multer for memory storage of PDFs
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 20 * 1024 * 1024 // 20 MB size limit
    },
    fileFilter: (req, file, cb) => {
    cb(null, true);
}
});

// 🖨️ Core Print Module Endpoints
router.post('/submit', upload.single('file'), printController.createPrintJob);
router.get('/history', printController.getPrintHistory);
router.put('/:id/status', printController.updatePrintJobStatus);

module.exports = router;
