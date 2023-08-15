const mongoose = require("mongoose");
const {
  encryptWithPublicKey,
  groupKeysEncryption,
} = require("../helper/encryption");
const { generateKeyPair } = require("../helper/generateKeys");
const group = require("../models/group");
const user = require("../models/user");
const { isUserInList } = require("../helper/userPresent");

exports.makeGroup = async (req, res) => {
  const userDetails = req.userDetails;
  const keys = generateKeyPair();
  const newGroup = await group.create({
    title: req.body.title,
    description: req.body.description,
    avatar: req.body.avatar,
    keys,
    admins: [userDetails._id],
    users: [userDetails._id],
  });

  const groupDetails = await group.findOne({ _id: newGroup._id }).populate({
    path: "users",
    select: "name avatar _id", // Only select name and avatar fields and exclude _id
  });

  const encryptedData = groupKeysEncryption(
    keys.private,
    keys.public,
    userDetails.keys.public
  );
  // const encryptedData = encryptWithPublicKey(userDetails.keys.public, {
  //   keys,
  // });

  return res.status(200).json({
    message: "Group Created Successfully",
    group: {
      keys: encryptedData,
      details: {
        _id: groupDetails._id,
        title: groupDetails.title,
        description: groupDetails.description,
        users: groupDetails.users,
        groupId: groupDetails.groupId,
        admins: groupDetails.admins,
      },
    },
  });
};

exports.joinGroup = async (req, res) => {
  const { userId, groupId } = req.body;

  const userDetails = await user.findOne({ _id: userId });
  if (!userDetails) {
    return res.status(404).json({ message: "User not found" });
  }

  const groupdetails = await group.findOne({ groupId });
  if (!groupdetails) {
    return res.status(404).json({ message: "Invalid Group ID" });
  }

  if (isUserInList(mongoose.Types.ObjectId(userId), groupdetails.users)) {
    return res.status(200).json({ message: "User already exists in group" });
  }

  if (userId in groupdetails.blacklistedUsers) {
    return res
      .status(401)
      .json({ message: "You have been blacklisted, by the admin" });
  }
  await group.updateOne(
    { _id: groupdetails._id },
    { $push: { users: userId } }
  );

  const groupDetails = await group.findOne({ _id: groupdetails._id }).populate({
    path: "users",
    select: "name avatar _id", // Only select name and avatar fields and _id
  });

  const encryptedData = groupKeysEncryption(
    groupdetails.keys.private,
    groupdetails.keys.public,
    userDetails.keys.public
  );

  return res.status(200).json({
    message: "User Added Successfully",
    group: {
      keys: encryptedData,
      details: {
        _id: groupDetails._id,
        title: groupDetails.title,
        description: groupDetails.description,
        users: groupDetails.users,
        groupId: groupDetails.groupId,
        admins: groupDetails.admins,
      },
    },
  });
};
