const mongoose = require("mongoose");

const verificationSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    createdAt: {
      type: Date,
    },
    expiresAt: {
      type: Date,
    },
    uniqueId:{
        type: String,
        unique: true
    }
  },
  {
    timestamp: true,
  }
);

module.exports = mongoose.model("UserVerification", verificationSchema);
