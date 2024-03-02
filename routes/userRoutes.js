const express = require("express");
const {
  registerUser,
  getAllUsers,
  loginUser,
  getUser,
  getUsers,
  verifyUser,
  forgotPassword,
  resetPassword,
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/signup", registerUser);
router.post("/signin", loginUser);
router.get("/users", protect, getAllUsers);
router.get("/me", protect, getUser);
router.get("/user/:id", protect, getUsers);
router.post("/user/verify/:userId/:uniqueString", verifyUser);
router.post("/forgot-password", forgotPassword)
router.post("/password-reset/:id/:uniqueString", resetPassword)


module.exports = router;
