const express = require("express");
const router = express.Router();

router.get("/", function (req, res) {
  return res.json({ message: "Hello!", user: req?.userDetails || "null" });
});

module.exports = router;
