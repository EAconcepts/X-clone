const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const Profile = require("../models/profileModel");
const mongoose = require("mongoose");

if (null) console.log("false");
// Upload avatar Image
const uploadAvatar = asyncHandler(async (req, res) => {
  const { avatar } = req.body;
  console.log(avatar);
  if (!avatar) res.status(400).json({ message: "Avatar field is required" });
  else {
    User.findByIdAndUpdate(
      req.user._id,
      { avatar },
      { new: true },
      { password: 0 }
    )
      .then((result) => {
        console.log(result);
        res.status(201).json({
          message: "Profile Image updated successfully!",
          data: result,
        });
      })
      .catch((error) => {
        console.log(error);
        res
          .status(400)
          .json({ message: "An error occured while updating profile image" });
      });
  }
});

// Get Avatar Image
const getAvatar = asyncHandler(async (req, res) => {
  User.findById(req.user._id)
    .then((result) => {
      console.log(result);
      res.status(200).json({ status: "Success", data: result.avatar });
    })
    .catch((error) => {
      console.log(error);
      res.status(400).json({
        message: error,
      });
    });
});

// Get Profile Details
// const getProfile= asyncHandler(async(req, res)=>{
//     const userId = req.user._id
//     User.findById(userId, {password: 0})
//     .then((result)=>{
//         console.log('user profile', result)
//         res.status(200).json({message: 'success', data: result})
//     })
//     .catch((error)=>{
//         console.log(error)
//         res.status(400).json({message: 'An error occured while getting user profile', error})
//     })
// })

// Follow a user
const followUser = asyncHandler(async (req, res) => {
  const userId = new mongoose.Types.ObjectId(req.params.id);
  const followerId = req.user._id;
  //   console.log(typeof userId);

  if (followerId.equals(userId)) {
    res.status(400).json({ message: "Cannot follow self" });
  } else {
    // check if user exists and
    const userExists = await User.findById(userId);
    if (userExists) {
      console.log(followerId, userId);
      // check if user has followed already
      const hasFollowed = await User.findOne({
        _id: followerId,
        "profile.following": userId,
      });
      //   Unfollow user
      if (hasFollowed) {
        console.log("User has already followed", hasFollowed);
        // Unfollower user and update follower details
        User.findOneAndUpdate(
          { _id: followerId, "profile.following": userId },
          { $pull: { "profile.following": userId } },
          { new: true }
        )
          .then((response) => {
            console.log("unfollow success", response);
            // Update user Details
            User.findOneAndUpdate(
              { _id: userId, "profile.followers": followerId },
              { $pull: { "profile.followers": followerId } },
              { new: true }
            )
              .then((unfollowed) => {
                res
                  .status(201)
                  .json({ message: "Unfollow success", data: response });
              })
              .catch((error) => {
                console.log("An error occured ", error);
                res.status(500).json({ message: "An error occured!", error });
              });
          })
          // Error unfollowing
          .catch((error) => {
            console.log("Could not unfollow", error);
            res.status(500).json({ message: "Error Unfollowing" });
          });
      }
      //   User has not been followed
      // Follow user
      else {
        console.log("User has not followed");

        // Update the followed user details
        User.findOneAndUpdate(
          { _id: followerId },
          { $push: { "profile.following": userId } },
          { new: true }
        )
          .then((follow) => {
            console.log("Follow success");
            // Update the follower schema
            User.findOneAndUpdate(
              { _id: userId },
              { $push: { "profile.followers": followerId } },
              { new: true }
            )
              .then((followed) => {
                console.log("followed");
                res
                  .status(201)
                  .json({ message: "Follow successful", data: follow });
              })
              .catch((error) => {
                console.log(error);
                res.status(500).json({ message: "An error occured", error });
              });
          })
          .catch((error) => {
            console.log("Unable to follow", error);
            res.status(500).json({ message: "Unable to follow", error: error });
          });
      }
    } else {
      console.log("user not found");
      res.status(400).json({ message: "User not found!" });
    }
  }
});
module.exports = { uploadAvatar, getAvatar, followUser };
