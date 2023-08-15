const express = require("express");
const { makeGroup } = require("../../controllers/group");
const router = express.Router();

router.post("/", makeGroup);

module.exports = router;
