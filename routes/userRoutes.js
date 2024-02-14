const express = require('express')
const { registerUser, getAllUsers, loginUser, getUser, getUsers } = require('../controllers/userController')
const { protect } = require("../middleware/authMiddleware");


const router = express.Router()

router.post('/signup', registerUser)
router.post("/signin", loginUser);
router.get('/users', protect, getAllUsers)
router.get("/me", protect, getUser);
router.get("/user/:id", protect, getUsers);


module.exports = router