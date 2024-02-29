const express = require("express");
const {
  createPost,
  getPost,
  getAllPosts,
  editPost,
  deletePost,
  uploadImage,
  handlePostLike,
  retweetPost,
} = require("../controllers/postController");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/multer");

const router = express.Router();

router.put("/edit-post/:id", protect, editPost);
router.post("/create-post", protect, createPost);
router.get("/:id", protect, getPost);
router.delete("/delete-post/:id", protect, deletePost);
router.get("/", getAllPosts);
router.post("/upload", protect, upload.array("image"), uploadImage);
router.post("/likes/:id", protect, handlePostLike);
router.post("/retweet/:id", protect, retweetPost)

module.exports = router;
