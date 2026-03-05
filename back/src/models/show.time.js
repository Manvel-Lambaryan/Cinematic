const mongoose = require("mongoose");

const showtimeSchema = new mongoose.Schema(
  {
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Movie",
      required: true,
    },
    cinema: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cinema",
      required: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    bookedSeats: [
      {
        seat: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Seat",
        },
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User", 
        },
        isPaid: { type: Boolean, default: false },
      },
    ],
    priceOverride: {
      type: Number, 
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Showtime", showtimeSchema);
