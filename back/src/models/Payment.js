const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Movie",
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cinema",
    },
    amount: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
    },
    currency: {
      type: String,
      default: "AMD",
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["wallet", "card", "crypto"],
      default: "wallet",
    },
    transactionId: {
      type: String,
      unique: true,
      default: () => `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
    },
  },
  { timestamps: true },
);

const Payment = mongoose.model("Payment", paymentSchema);
module.exports = Payment;
