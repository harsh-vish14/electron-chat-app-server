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
    groupId: {
      type: String,
      unique: true,
      trim: true,
    },
    avatar: {
      type: String,
      default: "https://geodash.gov.bd/uploaded/people_group/default_group.png",
      trim: true,
    },
    admins: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
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
    readOnly: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
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

// Custom pre-save hook to generate unique groupId based on title
GroupSchema.pre("save", async function (next) {
  if (!this.isModified("title")) {
    return next();
  }

  const modifiedTitle = this.title.replace(/ /g, "-"); // Replace spaces with hyphens
  const existingGroup = await this.constructor.findOne({
    groupId: modifiedTitle.toLowerCase(),
  });

  if (!existingGroup) {
    this.groupId = modifiedTitle.toLowerCase();
  } else {
    const groupTitleCounter = {};
    const groupsWithSameTitle = await this.constructor.find({
      title: this.title,
    });

    groupsWithSameTitle.forEach((group) => {
      groupTitleCounter[group.groupId] =
        (groupTitleCounter[group.groupId] || 0) + 1;
    });

    let counter = groupTitleCounter[modifiedTitle.toLowerCase()] || 1;
    while (true) {
      const newGroupId =
        counter === 1
          ? modifiedTitle.toLowerCase()
          : `${modifiedTitle.toLowerCase()}-${counter}`;
      if (!groupTitleCounter[newGroupId]) {
        this.groupId = newGroupId;
        break;
      }
      counter++;
    }
  }

  next();
});

module.exports = mongoose.model("Group", GroupSchema);
