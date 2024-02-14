const mongoose = require("mongoose");

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
  },
  {
    timestamp: true,
  }
);

module.exports = mongoose.model('User', userSchema)