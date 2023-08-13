const ErrorResponse = require("../helper/ErrorResponse");
const user = require("../models/user");
const tokenSchema = require("../models/token");
const { userSignInSchema, userLoginSchema } = require("../schema/user");
const jwt = require("jsonwebtoken");
const { hashPassword, comparePasswords } = require("../helper/passowrd");

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

  const hashedPassword = await hashPassword(req.body.password);
  const userData = await user.create({ ...req.body, password: hashedPassword });

  // token generation
  const token = await jwt.sign(
    {
      name: userData.name,
      email: userData.email,
      avatar: userData.avatar,
      _id: userData._id,
    },
    process.env.SECRET_KEY,
    {
      expiresIn: "30d",
    }
  );

  const currentDate = new Date();
  const thirtyDaysFromNow = new Date(currentDate);
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

  await tokenSchema.create({
    tokenId: token,
    uid: userData._id,
    expiration: thirtyDaysFromNow.toISOString(),
  });

  // sending token in cookie
  res.cookie("token", token, { httpOnly: true, secure: true }); // Make sure to use 'secure: true' if using HTTPS
  return res.status(200).json({ message: "Signing Successfully" });
};

exports.login = async (req, res) => {
  const response = userLoginSchema.safeParse(req.body);
  if (!response.success) {
    return res.status(400).json({ message: response.error.errors });
  }
  const { email, password } = req.body;

  const userData = await user.findOne({ email });
  if (!userData) {
    return res.status(404).json({ message: "Email Does not exists" });
  }

  if (!(await comparePasswords(password, userData.password))) {
    return res.status(404).json({ message: "Invalid Email/Password" });
  }

  const token = await jwt.sign(
    {
      name: userData.name,
      email: userData.email,
      avatar: userData.avatar,
      _id: userData._id,
    },
    process.env.SECRET_KEY,
    {
      expiresIn: "30d",
    }
  );

  const currentDate = new Date();
  const thirtyDaysFromNow = new Date(currentDate);
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

  await tokenSchema.updateOne({
    uid: userData._id,
    expiration: thirtyDaysFromNow.toISOString(),
  });

  // sending token in cookie
  res.cookie("token", token, { httpOnly: true, secure: true }); // Make sure to use 'secure: true' if using HTTPS

  return res.status(200).json({ message: "Logged In Successfully" });
};
