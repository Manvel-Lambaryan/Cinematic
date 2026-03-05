const express = require("express");
const { getShowtimeDetails } = require("../controllers/showtimes.controller.js");

const router = express.Router();

router.get("/:showtimeId", getShowtimeDetails);

module.exports = router;
