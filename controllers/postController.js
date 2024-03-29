const Post = require("../models/postModel");
const asyncHandler = require("express-async-handler");
const cloudinary = require("../utils/cloudinary");

// Creat post
// POST /api/post/create-post
// Private
const createPost = asyncHandler(async (req, res) => {
  const { content, tweetTime, images } = req.body;
  console.log(images);
  if (!content) {
    res.status(400).json({ message: "Please fill all fields" });
  }
  const post = await Post.create({
    content,
    user: req.user,
    tweetTime: tweetTime,
    // likedBy: null,
    likes: 0,
    images,
    // images: images && images,
  });
  if (post) {
    res.status(201).json({ message: "success", data: post });
  } else {
    res.status(400).json({ message: "Something happened!" });
  }
});

// Edit post
// POST /api/post/edit-post/:id
// Private
const editPost = asyncHandler(async (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) {
    res.status(400).json({ message: "Please fill all fields" });
  }
  const updatedPost = await Post.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  if (!updatedPost) {
    res.status(400).json({ message: "Post does not exist!" });
  }
  if (updatedPost) {
    res
      .status(201)
      .json({ message: "Post updated successfully!", data: updatedPost });
  } else {
    res.status(400).json({ message: "Something happened!" });
  }
});

// Get a post
// POST /api/post/:id
// Private
const getPost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (post) {
    res.status(200).json({
      message: `Post ${req.params.id} gotten successfully!`,
      data: post,
    });
  } else {
    res.status(400);
    throw new Error("Something went wrong!");
  }
});

// Get all posts
// POST /api/post/
// Private
const getAllPosts = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page);
  const limit = parseInt(req.query.limit);
  const posts = await Post.find()
    .sort({ _id: -1 })
    .populate("user")
    .skip((page - 1) * limit)
    .limit(limit);
  if (posts) {
    res.status(200).json({
      message: `success \n Returning (${limit}) results page ${page}`,
      data: posts,
    });
  } else {
    res.status(400);
    throw new Error("Unable to fetch posts");
  }
});

// Delete a post
// POST /api/post/delete-post/:id
// Private
const deletePost = asyncHandler(async (req, res) => {
  const post = await Post.findByIdAndDelete(req.params.id);
  if (post) {
    res.status(200).json({
      message: `Post ${req.params.id} deleted successfully!`,
      data: post,
    });
  } else {
    res.status(400);
    throw new Error("Something went wrong!");
  }
});

// upload post images
// POST /api/post/upload
// Private
const uploadImage = asyncHandler(async (req, res) => {
  const imgLinks = [];
  await uploadMultiple(imgLinks, req, res);
});
// cloudinary image upload fn
async function uploadMultiple(imgLinks, req, res) {
  for (let i = 0; i < req.files.length; i++) {
    await cloudinary.uploader.upload(req.files[i].path, (err, result) => {
      if (err) {
        console.log(err);
        return res.status(400).json({ message: "Error! Couldn't upload file" });
      }
      if (result) {
        let imageUrl = result.url;
        imgLinks.push(imageUrl);
      }
    });
    if (i === req.files.length - 1) {
      // let post = await Post.findOneAndUpdate(
      //   { _id: req.params.id },
      //   // { $push: { images: imageUrl } },
      //   { images: imgLinks },
      //   { new: true }
      // );
      return res.status(200).json({
        message: "Image uploaded successfully!",
        data: imgLinks,
      });
    }
  }
}

// Like a post
// POST /api/post/likes/:id
// Private
const handlePostLike = asyncHandler(async (req, res) => {
  const postId = req.params.id;
  console.log(req.user._id);
  // check if user has already liked post
  const checkedPost = await Post.findOne({
    likedBy: req.user._id,
    _id: postId,
  });
  console.log(checkedPost);
  if (checkedPost) {
    const removeLike = await Post.findOneAndUpdate(
      { _id: postId, likedBy: req.user._id },
      { $pull: { likedBy: req.user._id } },
      { new: true }
    );
    console.log(removeLike);
    if (removeLike) {
      res
        .status(200)
        .json({ message: "Unliked successfully!", data: removeLike });
    }
  } else {
    const post = await Post.findByIdAndUpdate(
      postId,
      { $push: { likedBy: req.user }, $inc: { likes: 1 } },
      { new: true }
    )
      .populate("likedBy")
      .populate("user");
    if (post) {
      res.status(200).json({ message: "Liked successful!", data: post });
    } else {
      res.status(400).json("Post do not exist.");
    }
  }
});

const retweetPost = asyncHandler(async (req, res) => {
  const postId = req.params.id;
  userId = req.user._id;

  // Check if user has retweeted before
  const hasRetweeted = await Post.findOne({ _id: postId, retweetedBy: userId });
  if (hasRetweeted) {
    const unRetweet = await Post.findOneAndUpdate(
      { _id: postId, retweetedBy: userId },
      { $pull: { retweetedBy: userId } },
      { new: true }
    );
    if (unRetweet) {
      res
        .status(200)
        .json({ message: "Tweet unretweeted successfully!", data: unRetweet });
    } else {
      res.status(400).json("Could not unretweet tweet!");
    }
  } else {
    const postRetweeted = await Post.findOneAndUpdate(
      { _id: postId },
      { $push: { retweetedBy: userId } },
      { new: true }
    );
    if (postRetweeted) {
      res
        .status(200)
        .json({
          message: "Tweet retweeted successfully!",
          data: postRetweeted,
        });
    } else {
      res.status(400).json("Something happenend!");
    }
  }
});

module.exports = {
  createPost,
  editPost,
  getPost,
  getAllPosts,
  deletePost,
  uploadImage,
  handlePostLike,
  retweetPost,
};
