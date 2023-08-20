const mongoose = require("mongoose");
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide user name"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Please provide email"],
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Please provide password"],
      trim: true,
    },
    avatar: {
      type: String,
      trim: true,
      default:
        "https://t4.ftcdn.net/jpg/04/10/43/77/360_F_410437733_hdq4Q3QOH9uwh0mcqAhRFzOKfrCR24Ta.jpg",
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
    configurations: {
      type: Object,
      default: {},
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
