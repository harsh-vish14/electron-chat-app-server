const mongoose = require("mongoose");
const AuthToken = new mongoose.Schema(
  {
    tokenId: {
      type: String,
      required: [true, "Provide Token"],
      trim: true,
    },
    uid: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "provide user id"],
      ref: "User",
    },
    blacklisted: {
      type: Boolean,
      default: false,
    },
    expiration: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AuthToken", AuthToken);
