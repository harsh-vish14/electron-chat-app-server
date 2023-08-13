const express = require("express");
const { userSignIn, getAllUsers, login } = require("../../controllers/user");

const router = express.Router();

router.get("/", getAllUsers);
router.post("/signin", userSignIn);
router.post("/login", login);

module.exports = router;
