const express = require("express");
const router = express.Router();
const routes = require("./operations/users");

// users routes
router.use("/user", routes);

module.exports = router;
