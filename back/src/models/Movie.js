const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    posterUrl: {
      type: String,
      required: true,
    },
    cinema: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cinema", 
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    genre: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 10,
    },
    releaseDate: {
      type: Date,
      required: true,
    },
    showTime: {
      type: String, // Store time as "14:30" format
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    videoUrl: {
      type: String, 
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Movie", movieSchema);
