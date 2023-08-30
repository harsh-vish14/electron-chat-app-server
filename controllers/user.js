const user = require("../models/user");
const tokenSchema = require("../models/token");
const {
  userSignInSchema,
  userLoginSchema,
  userDetailsUpdates,
} = require("../schema/user");
const jwt = require("jsonwebtoken");
const { hashPassword, comparePasswords } = require("../helper/passowrd");
const { generateKeyPair } = require("../helper/generateKeys");

exports.getAllUsers = async (req, res) => {
  const users = await user.find({});
  return res.status(200).json(users);
};

exports.userSignUp = async (req, res) => {
  const response = userSignInSchema.validateToString(req.body);
  if (response.error) {
    return res.status(400).json({
      success: false,
      message: response.message,
    });
  }

  const userExits = await user.findOne({ email: req.body.email });
  if (userExits) {
    return res
      .status(400)
      .json({ success: false, message: "User already exists" });
  }

  const keys = generateKeyPair();

  const hashedPassword = await hashPassword(req.body.password);
  const userData = await user.create({
    ...req.body,
    password: hashedPassword,
    keys,
  });

  // token generation
  const token = await jwt.sign(
    {
      name: userData.name,
      email: userData.email,
      avatar: userData.avatar,
      config: userData.configurations,
      _id: userData._id,
      keys,
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
  return res
    .status(200)
    .json({ success: true, message: "Signing Successfully" });
};

exports.login = async (req, res) => {
  const response = userLoginSchema.validateToString(req.body);
  if (response.error) {
    return res.status(400).json({ success: false, message: response.message });
  }
  const { email, password } = req.body;

  const userData = await user.findOne({ email });
  if (!userData) {
    return res
      .status(404)
      .json({ success: false, message: "Email Does not exists" });
  }

  if (!(await comparePasswords(password, userData.password))) {
    return res
      .status(404)
      .json({ success: false, message: "Invalid Email/Password" });
  }

  const token = await jwt.sign(
    {
      name: userData.name,
      email: userData.email,
      avatar: userData.avatar,
      _id: userData._id,
      keys: userData.keys,
      config: userData.configurations,
    },
    process.env.SECRET_KEY,
    {
      expiresIn: "30d",
    }
  );

  const currentDate = new Date();
  const thirtyDaysFromNow = new Date(currentDate);
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

  await tokenSchema.updateOne(
    { uid: userData._id },
    {
      tokenId: token,
      expiration: thirtyDaysFromNow.toISOString(),
    }
  );

  // sending token in cookie
  res.cookie("token", token, { httpOnly: true, secure: true }); // Make sure to use 'secure: true' if using HTTPS

  return res.status(200).json({ message: "Logged In Successfully" });
};

exports.updateDetails = async (req, res) => {
  const response = userDetailsUpdates.validateToString(req.body);

  if (response.error) {
    return res.status(400).json({ message: response.message });
  }

  const { name, email, avatar } = req.body;
  const userDetails = req.userDetails;
  await user.updateOne({ email }, { name, avatar });

  const token = await jwt.sign(
    {
      name,
      email: userDetails.email,
      avatar,
      _id: userDetails._id,
      keys: userDetails.keys,
      config: userData.configurations,
    },
    process.env.SECRET_KEY,
    {
      expiresIn: "30d",
    }
  );

  const currentDate = new Date();
  const thirtyDaysFromNow = new Date(currentDate);
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

  await tokenSchema.updateOne(
    { uid: userDetails._id },
    {
      tokenId: token,
      expiration: thirtyDaysFromNow.toISOString(),
    }
  );

  // sending token in cookie
  res.cookie("token", token, { httpOnly: true, secure: true }); // Make sure to use 'secure: true' if using HTTPS
  return res.status(200).json({ message: "User updated successfully" });
};
