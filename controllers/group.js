const { encryptWithPublicKey } = require("../helper/encryption");
const group = require("../models/group");

exports.makeGroup = async (req, res) => {
  const userDetails = req.userDetails;

  const newGroup = await group.create({
    description: req.body.description,
    avatar: req.body.avatar,
    users: [userDetails._id],
  });

  const groupDetails = await group.findOne({ _id: newGroup._id }).populate({
    path: "users",
    select: "name avatar -_id", // Only select name and avatar fields and exclude _id
  });

  const encryptedData = encryptWithPublicKey(
    userDetails.keys.public,
    groupDetails
  );

  return res.status(200).json({
    message: "Group Created Successfully",
    group: encryptedData,
  });
};
