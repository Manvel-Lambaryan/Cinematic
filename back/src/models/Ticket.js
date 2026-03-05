const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const ticketSchema = new mongoose.Schema(
  {
    ticketId: {
      type: String,
      default: () => uuidv4(),
      unique: true,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
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
    seat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seat",
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "used", "cancelled"],
      default: "active",
    },
    qrData: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.getOrCreateMode
  ? mongoose.model("Ticket", ticketSchema)
  : mongoose.model("Ticket", ticketSchema);
;
