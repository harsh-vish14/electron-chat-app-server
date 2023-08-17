const mongoose = require("mongoose");
const {
  encryptWithPublicKey,
  groupKeysEncryption,
} = require("../helper/encryption");
const { generateKeyPair } = require("../helper/generateKeys");
const group = require("../models/group");
const user = require("../models/user");
const { isUserInList } = require("../helper/userPresent");
const chats = require("../models/chats");

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

// TODO: check all functions from below
exports.joinGroup = async (req, res) => {
  const { groupId } = req.body;
  userDetails = req.userDetails;

  const userId = mongoose.Types.ObjectId(userDetails._id);

  const groupdetails = await group.findOne({ groupId });
  if (!groupdetails) {
    return res.status(404).json({ message: "Invalid Group ID" });
  }

  if (isUserInList(userId, groupdetails.users)) {
    return res.status(200).json({ message: "User already exists in group" });
  }

  if (isUserInList(userId, groupdetails.blacklistedUsers)) {
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

exports.ExitGroup = async (req, res) => {
  const { groupId } = req.body;
  const userDetails = req.userDetails;
  const userId = mongoose.Types.ObjectId(userDetails._id);

  const groupdetails = await group.findOne({ groupId });
  if (!groupdetails) {
    return res.status(404).json({ message: "Invalid Group ID" });
  }

  await group.updateOne({ _id: groupId }, { $pull: { users: userId } });
  return res.status(200).json({ message: "User Removed Successfully" });
};

exports.addBlackListUser = async (userId, groupId) => {
  userId = mongoose.Types.ObjectId(userId);
  groupId = mongoose.Types.ObjectId(groupId);

  const loggedUser = req.userDetails;

  const userDetails = await user.findOne({ _id: userId });
  if (!userDetails) {
    return { message: "User not found", success: false };
  }

  const groupdetails = await group.findOne({ _id: groupId });
  if (!groupdetails) {
    return { message: "Group not Found", success: false };
  }

  if (
    !isUserInList(mongoose.Types.ObjectId(loggedUser._id), groupdetails.admins)
  ) {
    return { message: "Unauthorized", success: false };
  }

  await group.updateOne(
    { _id: groupdetails._id },
    { $push: { blacklistedUsers: userId } }
  );
  return { message: "User blacklisted successfully", success: true };
};

exports.removeBlackListUser = async (userId, groupId) => {
  userId = mongoose.Types.ObjectId(userId);
  groupId = mongoose.Types.ObjectId(groupId);
  const loggedUser = req.userDetails;

  const userDetails = await user.findOne({ _id: userId });
  if (!userDetails) {
    return { message: "User not found", success: false };
  }

  const groupdetails = await group.findOne({ _id: groupId });
  if (!groupdetails) {
    return { message: "Group not Found", success: false };
  }

  if (
    !isUserInList(mongoose.Types.ObjectId(loggedUser._id), groupdetails.admins)
  ) {
    return { message: "Unauthorized", success: false };
  }

  await group.updateOne(
    { _id: groupdetails._id },
    { $pull: { blacklistedUsers: userId } }
  );

  return { message: "User removed blacklisted Successfully", success: true };
};

exports.getAllUserGroups = async (req, res) => {
  const userDetails = req.userDetails;
  try {
    const groups = await group.aggregate([
      {
        $match: { users: mongoose.Types.ObjectId(userDetails._id) }, // Match the specified user's ObjectId in the users array
      },
      {
        $project: {
          title: 1,
          avatar: 1,
          userCount: { $size: "$users" },
        },
      },
    ]);

    return res.status(200).json({ groups });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "server error occurred, please try again later" });
  }
};

exports.getGroupDetails = async (req, res) => {
  const { groupId } = req.body;
  const userDetails = req.userDetails;

  const groupdetails = await group
    .findOne({ _id: mongoose.Types.ObjectId(groupId) })
    .populate({
      path: "users",
      select: "name avatar _id", // Only select name and avatar fields and _id
    });

  if (!groupdetails) {
    return res.status(404).json({ message: "Invalid Group ID" });
  }

  if (
    !isUserInList(mongoose.Types.ObjectId(userDetails._id), groupdetails.users)
  ) {
    return res.status(200).json({ message: "User Does not exist" });
  }

  const encryptedData = groupKeysEncryption(
    groupdetails.keys.private,
    groupdetails.keys.public,
    userDetails.keys.public
  );
  const blacklisted = isUserInList(
    mongoose.Types.ObjectId(userDetails._id),
    groupdetails.blacklistedUsers
  );

  if (blacklisted) {
    return res.status(200).json({
      group: {
        keys: encryptedData,
        blacklisted,
        chats: [],
        details: {
          _id: groupdetails._id,
          title: groupdetails.title,
          description: groupdetails.description,
          users: groupdetails.users,
          groupId: groupdetails.groupId,
          admins: groupdetails.admins,
        },
      },
    });
  }

  const chats = await chats.find({ gid: groupdetails._id }).populate({
    path: "users",
    select: "name avatar _id",
  });

  return res.status(200).json({
    group: {
      keys: encryptedData,
      blacklisted,
      chats,
      details: {
        _id: groupdetails._id,
        title: groupdetails.title,
        description: groupdetails.description,
        users: groupdetails.users,
        groupId: groupdetails.groupId,
        admins: groupdetails.admins,
      },
    },
  });
};

exports.makeAdmin = async (req, res) => {
  const { groupId, userId } = req.body;
  const loggedUser = req.userDetails;

  const userDetails = await user.findOne({
    _id: mongoose.Types.ObjectId(userId),
  });
  if (!userDetails) {
    return res.status(404).json({ message: "User not found", success: false });
  }

  const groupdetails = await group.findOne({ _id: groupId });
  if (!groupdetails) {
    return res.status(404).json({ message: "Group not Found", success: false });
  }

  if (
    !isUserInList(mongoose.Types.ObjectId(loggedUser._id), groupdetails.admins)
  ) {
    return res.status(401).json({ message: "Unauthorized", success: false });
  }

  if (
    !isUserInList(mongoose.Types.ObjectId(userDetails._id), groupdetails.users)
  ) {
    return res
      .status(404)
      .json({ message: "User is not in This group", success: false });
  }

  if (isUserInList(mongoose.Types.ObjectId(userId), groupdetails.admins)) {
    return res
      .status(200)
      .json({ message: "User is already admin", success: false });
  }

  await group.updateOne({ _id: groupId }, { $push: { admins: userId } });
  return res
    .status(200)
    .json({ message: "User made admin successfully", success: true });
};
