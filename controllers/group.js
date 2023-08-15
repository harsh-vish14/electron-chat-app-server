const {
  encryptWithPublicKey,
  groupKeysEncryption,
} = require("../helper/encryption");
const { generateKeyPair } = require("../helper/generateKeys");
const group = require("../models/group");

exports.makeGroup = async (req, res) => {
  const userDetails = req.userDetails;

  const keys = generateKeyPair();

  const newGroup = await group.create({
    title: req.body.title,
    description: req.body.description,
    avatar: req.body.avatar,
    keys,
    users: [userDetails._id],
  });

  const groupDetails = await group.findOne({ _id: newGroup._id }).populate({
    path: "users",
    select: "name avatar -_id", // Only select name and avatar fields and exclude _id
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
      },
    },
  });
};
