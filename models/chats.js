const mongoose = require("mongoose");
const chatsSchema = new mongoose.Schema(
  {
    uid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "PLease provide user id"],
    },
    gid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: [true, "PLease provide group id"],
    },
    publicNotification: {
      type: String,
      trim: true,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
    message: {
      type: String,
      required: [true, "Please provide message"],
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Chat", chatsSchema);
