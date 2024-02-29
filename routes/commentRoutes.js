const express = require("express");
const { postComment, getAllComments, deleteComment, getComment } = require("../controllers/commentController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/create/:id", protect, postComment);
router.get("/:id", getComment);
router.delete("/delete/:id", protect, deleteComment);
router.get("/all/:postId", getAllComments);


module.exports = router