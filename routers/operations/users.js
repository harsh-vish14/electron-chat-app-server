const express = require("express");
const {
  userSignUp,
  getAllUsers,
  login,
  updateDetails,
} = require("../../controllers/user");
const { userAuth } = require("../../middleware/userAuth");

const router = express.Router();

router.get("/", getAllUsers);
router.post("/signup", userSignUp);
router.post("/login", login);
router.post("/update", userAuth, updateDetails);

module.exports = router;
