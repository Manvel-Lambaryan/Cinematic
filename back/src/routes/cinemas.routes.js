const express = require("express");
const router = express.Router();
const cinemaController = require("../controllers/cinemas.controller");

router.post("/create", cinemaController.createCinema);
router.post("/:cinemaId/seats/bulk", cinemaController.createSeatsInBulk);
router.get("/", cinemaController.getAllCinemas);
router.delete("/:id", cinemaController.deleteCinema);
router.get('/:id', cinemaController.getCinemaById);

module.exports = router;