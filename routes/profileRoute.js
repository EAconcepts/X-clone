const express = require('express')
const { protect } = require('../middleware/authMiddleware')
const { uploadAvatar, getAvatar, getProfile, followUser } = require('../controllers/profileController')

const router = express.Router()

router.post('/avatar-upload', protect, uploadAvatar)
router.get('/avatar', protect, getAvatar)
// router.get('/', protect, getProfile)
router.post('/follow/:id', protect, followUser)

module.exports = router