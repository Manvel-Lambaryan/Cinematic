const express = require("express");
const router = express.Router();
const cinemaRoutes = require("./cinemas.routes");

router.use("/cinema", cinemaRoutes);

module.exports = router;