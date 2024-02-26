const asyncHandler = require("express-async-handler");
const Comment = require("../models/commentModel");
const Post = require("../models/postModel");

// Create a comment

const postComment = asyncHandler(async (req, res) => {
  const { comment, images, postId } = req.body;
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

const getComment = asyncHandler(async (req, res) => {});

const deleteComment = asyncHandler(async (req, res) => {});

const getAllComments = asyncHandler(async (req, res) => {
  const postId = req.params.postId;

  const allComments = await Comment.find({post: postId});

  if (allComments) {
    console.log('success');
    res.status(200).json(allComments);
  } else {
    res.status(400).json('cannot find comments');
    console.log("cannot find comments");
  }
});
module.exports = { postComment, getComment, deleteComment, getAllComments };
