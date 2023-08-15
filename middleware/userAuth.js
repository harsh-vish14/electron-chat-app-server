const ErrorResponse = require("../helper/ErrorResponse");
const jwt = require("jsonwebtoken");
const { thirtyDaysWindow } = require("../helper/thirdyDayWindow");
const user = require("../models/user");

exports.userAuth = async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).send({ message: "User is not authorized" }); // Unauthorized
  }

  try {
    const tokenDetails = await jwt.verify(token, process.env.SECRET_KEY);
    if (!thirtyDaysWindow(tokenDetails.iat, tokenDetails.exp)) {
      return res
        .status(403)
        .send({ message: "Token has expired, Please try login again." });
    }

    const userData = await user.findOne({ email: tokenDetails.email });
    if (!userData) {
      return res.status(404).json({ message: "Email Does not exists" });
    }

    req.userDetails = userData; // Attach user information to the request object
    next(); // Move to the next middleware or route handler
  } catch (err) {
    console.log("middelware: ", err);
    return res.status(403); // Forbidden
  }
};
