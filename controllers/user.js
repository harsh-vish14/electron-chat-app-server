const ErrorResponse = require("../helper/ErrorResponse");
const user = require("../models/user");
const { userSignInSchema } = require("../schema/user");

exports.getAllUsers = async (req, res) => {
  const users = await user.find({});
  return res.status(200).json(users);
};

exports.userSignIn = async (req, res) => {
  const response = userSignInSchema.safeParse(req.body);
  if (!response.success) {
    return ErrorResponse(400, response.error.message);
  }
  // const { name, email, password, avatar } = req.body;
};
