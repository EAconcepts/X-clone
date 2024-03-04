const express = require('express')
const { protect } = require('../middleware/authMiddleware')
const { uploadAvatar, getAvatar } = require('../controllers/profileController')

const router = express.Router()

router.post('/avatar-upload', protect, uploadAvatar)
router.get('/avatar', protect, getAvatar)

module.exports = router