const mongoose = require("mongoose");

const cinemaSchema = mongoose.Schema(
  {
    numbering: {
      type: Number,
      required: true,
    },
    seats: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Seat",
        required: true,
      },
    ],
  },
  { timestamps: true },
);

module.exports = mongoose.model("Cinema", cinemaSchema);
