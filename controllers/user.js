const ErrorResponse = require("../helper/ErrorResponse");
const user = require("../models/user");
const tokenSchema = require("../models/token");
const { userSignInSchema } = require("../schema/user");
const jwt = require("jsonwebtoken");

exports.getAllUsers = async (req, res) => {
  const users = await user.find({});
  return res.status(200).json(users);
};

exports.userSignIn = async (req, res) => {
  const response = userSignInSchema.safeParse(req.body);
  if (!response.success) {
    return res.status(400).json({ message: response.error.errors });
  }

  const userExits = await user.findOne({ email: req.body.email });
  if (userExits) {
    return res.status(400).json({ message: "User already exists" });
  }
  const userData = await user.create(req.body);

  const token = await jwt.sign(userData.toJSON(), process.env.SECRET_KEY, {
    expiresIn: "30d",
  });

  const currentDate = new Date();
  const thirtyDaysFromNow = new Date(currentDate);
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

  await tokenSchema.create({
    tokenId: token,
    uid: userData._id,
    expiration: thirtyDaysFromNow.toISOString(),
  });

  res.cookie("token", token, { httpOnly: true, secure: true }); // Make sure to use 'secure: true' if using HTTPS

  return res.status(200).json({ userData: userData });
};
