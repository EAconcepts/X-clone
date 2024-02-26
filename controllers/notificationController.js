const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const Notification = require("../models/notificationModel");
const Post = require("../models/postModel");

const createNotification = asyncHandler(async (req, res) => {
  const { message, postId } = req.body;
  const userExist = await User.findById(req.user._id);
  const checkPost = await Post.findById(postId);
  let postUserId;
  if (checkPost) {
    postUserId = checkPost.user;
  }
  if (req.user._id === postUserId) {
    return res
      .status(201)
      .json({ message: "Will not send notification for own tweet" });
  }
  if (userExist && req.user._id !== postUserId) {
    if ((!message, !postId)) {
      throw new Error("Please provide all parameters");
    }
    if (userExist) {
      const notification = await Notification.create({
        message,
        post: postId,
        user: req.user._id,
      });
      if (notification) {
        res.status(200).json({
          message: "success",
          data: notification,
        });
      } else {
        throw new Error("Could not send notification!!");
      }
    }
  } else {
    throw new Error("Something happened!");
  }
});

const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({user: req.user._id}).populate('user').populate('post').sort({_id: -1})
  if(notifications){
    return res.status(200).json({
        message: 'success',
        data: notifications
    })
  }else{
throw new Error('Could not fetch posts!')
  }
});

module.exports = { createNotification, getNotifications };
