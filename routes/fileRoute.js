const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/multer');
const { uploadImage } = require('../controllers/postController');

const router = express.Router()

router.post("/upload", protect, upload.array("image"), uploadImage);


module.exports = router