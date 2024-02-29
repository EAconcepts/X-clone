const asyncHandler = require("express-async-handler");
const Comment = require("../models/commentModel");
const Post = require("../models/postModel");

// Create a comment
const postComment = asyncHandler(async (req, res) => {
  const { comment, images } = req.body;
  const postId = req.params.id;
  if (!postId) {
    res.status(400);
    throw new Error("Post id cannot be empty!");
  }
  if (!comment && !images) {
    res.status(400);
    throw new Error("Comment cannot be empty");
  } else {
    const postExits = await Post.findOne({ _id: postId });
    // console.log(postExits)

    if (postExits) {
      const postComment = await Comment.create({
        comment,
        images,
        user: req.user,
        post: postId,
      });
      if (postComment) {
        return res.status(201).json({ message: "success", data: postComment });
      } else {
        res.status(400);
        throw new Error("Something happened!");
      }
    } else {
      res.status(400);
      throw new Error("Tweet do not exist!");
    }
  }
});

// Get a single comment
const getComment = asyncHandler(async (req, res) => {
  const commentId = req.params.id;
  const getPost = await Comment.findById(commentId);
  if (getPost) {
    res.status(200).json({ message: "Success", data: getPost });
  } else {
    res.status(400).json("Cannot find comment");
  }
});

// Delete a single comment
const deleteComment = asyncHandler(async (req, res) => {
  const commentId = req.params.id;
  const userId = req.user._id;

  const deletedComment = await Comment.findOneAndDelete({
    _id: commentId,
    user: userId,
  });
  if (deletedComment) {
    res.status(200).json({ message: "Success", data: deletedComment });
  } else {
    res.status(400).json("Post do not exist");
  }
});

// Get all comments
const getAllComments = asyncHandler(async (req, res) => {
  const postId = req.params.postId;

  const allComments = await Comment.find({ post: postId });

  if (allComments) {
    console.log("success");
    res.status(200).json(allComments);
  } else {
    res.status(400).json("cannot find comments");
  }
});
module.exports = { postComment, getComment, deleteComment, getAllComments };
