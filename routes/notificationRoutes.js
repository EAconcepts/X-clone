const express = require('express')
const { protect } = require('../middleware/authMiddleware')
const { createNotification, getNotifications } = require('../controllers/notificationController')

const router = express.Router()

router.post('/', protect, createNotification)
router.get("/", protect, getNotifications);

module.exports = router