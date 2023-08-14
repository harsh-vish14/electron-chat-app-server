const mongoose = require("mongoose");
const GroupSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      trim: true,
    },
    avatar: {
      type: String,
      default: "https://geodash.gov.bd/uploaded/people_group/default_group.png",
      trim: true,
    },
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    blacklistedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Group", GroupSchema);
