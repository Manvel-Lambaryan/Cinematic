const mongoose = require("mongoose");

const seatSchema = mongoose.Schema(
  {
    numbering: {
      type: Number,
      required: true,
    },
    x: {
      type: Number,
      required: true,
    },
    y: {
      type: Number,
      required: true,
    },
    types: {
      type: String,
      enum: ["VIP", "MEDIUM", "NORMAL"],
      default: "NORMAL",
    },
    status: {
      type: String,
      enum: ["available", "booked", "selected"],
      default: "available",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Seat", seatSchema);
