const Movie = require('../models/Movie');

const createMovie = async (movieData) => {
  return await Movie.create(movieData);
};

const getAllMovies = async () => {
  return await Movie.find().sort({ createdAt: -1 });
};

module.exports = {
  createMovie,
  getAllMovies
};