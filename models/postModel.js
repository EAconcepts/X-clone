
const mongoose = require('mongoose')

const postSchema = mongoose.Schema(
  {
    content: {
      type: String,
      required: [true, "Please enter blog story"],
    },
    tweetTime: {
      type: String,
      required: [false, "Could not get tweetime"],
    },
    likes: {
      type: Number,
    },
    likedBy: [
      {
        // type: Array,
        // default: [mongoose.Schema.Types],
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    images: {
      type: [String],
      required: false,
    },
    comments: [{
      type:mongoose.Schema.ObjectId,
      ref: 'Comment'
  }],
  },
  {
    timestamp: true,
  }
);

module.exports = mongoose.model('Post', postSchema)