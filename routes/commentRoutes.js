const express = require("express");
const { postComment, getAllComments, deleteComment, getComment } = require("../controllers/commentController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/create", protect, postComment);
router.get("/:id", protect, getComment);
router.delete("/delete/:id", deleteComment);
router.get("/all/:postId", getAllComments);


module.exports = router