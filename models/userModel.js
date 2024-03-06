const mongoose = require("mongoose");


const profileSchema = mongoose.Schema({
  status: {
    type: String,
  },
  location: {
    type: String,
  },
  birthDate: {
    type: Date,
  },
  following: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  followers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  pinnedTweet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post",
  },
  website: {
    type: String,
  },
});


const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter a name"],
    },
    email: {
      type: String,
      required: [true, "Please enter a valid email"],
      unique: true,
    },
    username: {
      type: String,
      required: [true, "Please enter a valid username"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Please enter a password"],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    avatar: {
      type: String,
    },
    profile: {
      type: profileSchema
      // type: Map,
      // of: profileSchema,
    },
  },
  {
    timestamp: true,
  }
);



module.exports = mongoose.model("User", userSchema);
