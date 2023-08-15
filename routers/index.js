const express = require("express");
const router = express.Router();
const userRoutes = require("./operations/users");
const groupRoutes = require("./operations/groups");
const { userAuth } = require("../middleware/userAuth");

router.use("/user", userRoutes);

router.use("/group", userAuth, groupRoutes);

module.exports = router;
