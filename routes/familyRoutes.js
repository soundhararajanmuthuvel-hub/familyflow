const express = require("express");
const router = express.Router();
const { createFamily } = require("../controllers/familyController");

router.post("/create", createFamily);

module.exports = router;