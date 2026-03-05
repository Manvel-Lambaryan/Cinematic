const express = require("express");
const router = express.Router();
const Movie = require("../models/Movie"); 

const {
  addMovie,
  getMovies,
  deleteMovie,
  getTrailer,
  getUploadsList,
  updateMovie,
  searchMovie,
  getMovieById,
} = require("../controllers/movies.controller");

const upload = require("../middlewares/upload.middleware");
const { protect } = require("../middlewares/auth.middleware");
const { admin } = require("../middlewares/role.middleware");

router.get("/", getMovies);
router.get("/uploads-list", getUploadsList);
router.get("/search/:title", searchMovie);
router.get("/:id", getMovieById);
router.get("/:id/trailer", getTrailer);

router.patch(
  "/:id",
  protect,
  admin,
  upload.fields([
    { name: "posterUrl", maxCount: 1 },
    { name: "imageUrl", maxCount: 1 },
    { name: "videoUrl", maxCount: 1 },
  ]),
  updateMovie,
);

router.delete("/:id", protect, admin, deleteMovie);

router.post(
  "/add-movie",
  protect,
  admin,
  upload.fields([
    { name: "posterUrl", maxCount: 1 },
    { name: "imageUrl", maxCount: 1 },
    { name: "videoUrl", maxCount: 1 },
  ]),
  addMovie,
);

module.exports = router;
