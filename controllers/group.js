const mongoose = require("mongoose");
const { groupKeysEncryption } = require("../helper/encryption");
const { generateKeyPair } = require("../helper/generateKeys");
const group = require("../models/group");
const user = require("../models/user");
const { isUserInList } = require("../helper/userPresent");
const { chatsForGroup } = require("./chats");

exports.makeGroup = async (req, res) => {
  const userDetails = req.userDetails;
  const keys = generateKeyPair();
  const newGroup = await group.create({
    title: req.body.title,
    description: req.body.description,
    avatar: req.body.avatar,
    keys,
    admins: [userDetails._id],
    users: [{ id: userDetails._id, joinedAt: new Date() }],
  });

  const groupDetails = await group.findOne({ _id: newGroup._id }).populate({
    path: "users.id",
    select: "name avatar joinedAt _id", // Only select name and avatar fields and exclude _id
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
    { $push: { users: { id: userId, joinedAt: new Date() } } }
  );

  const groupDetails = await group.findOne({ _id: groupdetails._id }).populate({
    path: "users.id",
    select: "name avatar joinedAt _id", // Only select name and avatar fields and _id
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

  await group.updateOne({ _id: groupId }, { $pull: { users: { id: userId } } });
  return res.status(200).json({ message: "User Removed Successfully" });
};

exports.addBlackListUser = async (userId, loggedUser, groupId) => {
  userId = mongoose.Types.ObjectId(userId);
  groupId = mongoose.Types.ObjectId(groupId);

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

exports.removeBlackListUser = async (userId, loggedUser, groupId) => {
  userId = mongoose.Types.ObjectId(userId);
  groupId = mongoose.Types.ObjectId(groupId);

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
          joinedAt: 1,
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
      path: "users.id",
      select: "name avatar _id joinedAt", // Only select name and avatar fields _id and joinedAt
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

  const userJointedAt = "";
  const groupsUsers = groupdetails.users;
  for (let i = 0; i < groupsUsers.length; i++) {
    if (groupsUsers[i]._id == userDetails._id) {
      userJointedAt = groupsUsers[i].joinedAt;
    }
  }

  const chats = await chatsForGroup(
    groupdetails._id,
    userJointedAt,
    groupdetails.showOldChats
  );

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

exports.makeAdmin = async (userId, loggedUser, groupId) => {
  const userDetails = await user.findOne({
    _id: mongoose.Types.ObjectId(userId),
  });
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

  if (!isUserInList(mongoose.Types.ObjectId(userId), groupdetails.users)) {
    return { message: "User is not in This group", success: false };
  }

  if (isUserInList(mongoose.Types.ObjectId(userId), groupdetails.admins)) {
    return { message: "User is already admin", success: false };
  }

  await group.updateOne({ _id: groupId }, { $push: { admins: userId } });
  return { message: "User made admin successfully", success: true };
};

exports.makeReadOnly = async (userId, loggedUser, groupId) => {
  const userDetails = await user.findOne({
    _id: mongoose.Types.ObjectId(userId),
  });
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

  if (!isUserInList(mongoose.Types.ObjectId(userId), groupdetails.users)) {
    return { message: "User is not in This group", success: false };
  }

  if (isUserInList(mongoose.Types.ObjectId(userId), groupdetails.readOnly)) {
    return { message: "User is already On Read Only", success: false };
  }

  await group.updateOne({ _id: groupId }, { $push: { readOnly: userId } });
  return { message: "User made Read Only", success: true };
};

exports.changeGroupConfigurations = async (loggedUser, config) => {
  await user.updateOne({ _id: loggedUser._id }, { configurations: config });
  return { message: "Configurations Updated Successfully", success: true };
};
