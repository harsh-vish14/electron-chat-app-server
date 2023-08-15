const mongoose = require("mongoose");
const GroupSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please Provide group title"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    avatar: {
      type: String,
      default: "https://geodash.gov.bd/uploaded/people_group/default_group.png",
      trim: true,
    },
    keys: {
      public: {
        type: String,
        trim: true,
        required: [true, "Please provide public key of user"],
      },
      private: {
        type: String,
        trim: true,
        required: [true, "Please provide private key of user"],
      },
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
