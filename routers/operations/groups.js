const express = require("express");
const { makeGroup, joinGroup } = require("../../controllers/group");
const router = express.Router();

router.post("/", makeGroup);
router.post("/join", joinGroup);

module.exports = router;
