const express = require("express");
const {
  makeGroup,
  joinGroup,
  ExitGroup,
  getAllUserGroups,
  getGroupDetails,
} = require("../../controllers/group");
const router = express.Router();

router.post("/make", makeGroup);
router.post("/join", joinGroup);
router.post("/exit", ExitGroup);
router.post("/all", getAllUserGroups);
router.post("/details", getGroupDetails);

module.exports = router;
