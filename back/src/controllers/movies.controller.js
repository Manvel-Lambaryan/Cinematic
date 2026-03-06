const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/apiError");
const path = require("path");
const fs = require("fs");
const Movie = require("../models/Movie");

const deleteFile = (filePath) => {
  if (filePath) {
    const absolutePath = path.join(process.cwd(), "public", filePath);
    if (fs.existsSync(absolutePath)) {
      try {
        fs.unlinkSync(absolutePath);
      } catch (err) {
        console.error(`Error deleting file at ${absolutePath}:`, err);
      }
    }
  }
};

const addMovie = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    cinema,
    genre,
    rating,
    duration,
    releaseDate,
    showTime,
    price,
  } = req.body;

  const movie = await Movie.create({
    title,
    description,
    cinema,
    genre,
    rating: rating || 0,
    releaseDate: releaseDate || new Date(),
    showTime: showTime || "00:00", // Default time if not provided
    duration: duration || 120,
    price: price || 0,
    posterUrl: req.files["posterUrl"]
      ? `/uploads/not/${req.files["posterUrl"][0].filename}`
      : null,
    imageUrl: req.files["imageUrl"]
      ? `/uploads/${req.files["imageUrl"][0].filename}`
      : null,
    videoUrl: req.files["videoUrl"]
      ? `/uploads/videos/${req.files["videoUrl"][0].filename}`
      : null,
  });

  res.status(201).json({ success: true, data: movie });
});

const getMovies = asyncHandler(async (req, res) => {
  const movies = await Movie.find().sort({ createdAt: -1 });
  res.status(200).json({ data: movies });
});

const getTrailer = asyncHandler(async (req, res) => {
  const movie = await Movie.findById(req.params.id);
  if (!movie || !movie.videoUrl) {
    throw new ApiError(404, "Trailer not found");
  }
  res.status(200).json({ data: { videoUrl: movie.videoUrl } });
});

const getUploadsList = asyncHandler(async (req, res) => {
  const uploadsPath = path.join(process.cwd(), "public", "uploads", "not");

  if (!fs.existsSync(uploadsPath)) {
    return res.status(200).json([]);
  }

  fs.readdir(uploadsPath, (err, files) => {
    if (err) throw new ApiError(500, "Read error from uploads folder");
    const images = files.filter((f) => /\.(jpg|jpeg|png|gif|webp)$/i.test(f));
    res.status(200).json(images);
  });
});

const deleteMovie = asyncHandler(async (req, res) => {
  const movie = await Movie.findById(req.params.id);

  if (!movie) {
    throw new ApiError(404, "Movie not found");
  }

  deleteFile(movie.posterUrl);
  deleteFile(movie.imageUrl);
  deleteFile(movie.videoUrl);

  await Movie.findByIdAndDelete(req.params.id);

  res
    .status(200)
    .json({ message: "Movie and associated files deleted successfully" });
});

const updateMovie = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  if (req.files) {
    if (req.files["posterUrl"]) {
      updates.posterUrl = `/uploads/not/${req.files["posterUrl"][0].filename}`;
    }
    if (req.files["imageUrl"]) {
      updates.imageUrl = `/uploads/${req.files["imageUrl"][0].filename}`;
    }
    if (req.files["videoUrl"]) {
      updates.videoUrl = `/uploads/videos/${req.files["videoUrl"][0].filename}`;
    }
  }

  const movie = await Movie.findByIdAndUpdate(id, updates, { new: true });

  if (!movie) {
    throw new ApiError(404, "Movie not found");
  }

  res.status(200).json({ success: true, data: movie });
});

const searchMovie = asyncHandler(async (req, res) => {
  const movies = await Movie.find({
    title: { $regex: req.params.title, $options: "i" },
  }).limit(5);
  res.json(movies);
});

const getMovieById = asyncHandler(async (req, res) => {
  const movie = await Movie.findById(req.params.id);
  if (!movie) throw new ApiError(404, "Movie not found");
  res.json(movie);
});

module.exports = {
  addMovie,
  getMovies,
  getTrailer,
  getUploadsList,
  deleteMovie,
  updateMovie,
  searchMovie,
  getMovieById,
};
