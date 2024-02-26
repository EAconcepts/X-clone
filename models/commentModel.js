const mongoose = require('mongoose')

const commentSchema = mongoose.Schema(
  {
    comment: {
      type: String,
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },
    images: {
      type: [String],
    //   default: 
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    likedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    comments: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
    },
  },
  {
    timestamps: true,
  }
);

const commentModel = mongoose.model('Comment', commentSchema)

module.exports = commentModel