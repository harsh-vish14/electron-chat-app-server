const express = require("express");
const { userSignIn, getAllUsers } = require("../../controllers/user");

const router = express.Router();

router.get("/", getAllUsers);
router.post("/signin", userSignIn);

module.exports = router;
