const User = require("../models/User");
const Payment = require("../models/Payment");
const Seat = require("../models/Seat");
const Ticket = require("../models/Ticket");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/apiError");
const ApiResponse = require("../utils/apiResponse");
const { v4: uuidv4 } = require("uuid");

const handlePayment = asyncHandler(async (req, res) => {
  const { userId, cinemaId, movieId, selectedSeats, totalPrice } = req.body;

  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, "User not found");

  if (user.balance < totalPrice) {
    throw new ApiError(400, "Insufficient funds in your wallet");
  }

  const seatIds = selectedSeats.map((s) => s._id);

  const existingTickets = await Ticket.find({
    movie: movieId,
    seat: { $in: seatIds },
  });

  if (existingTickets.length > 0) {
    throw new ApiError(
      400,
      "One or more seats are already booked for this movie",
    );
  }

  const ticketsData = selectedSeats.map((seat) => {
    const ticketId = uuidv4();
    return {
      ticketId,
      user: userId,
      movie: movieId,
      cinema: cinemaId,
      seat: seat._id,
      price: seat.price || totalPrice / selectedSeats.length,
      qrData: JSON.stringify({
        ticketId,
        userId,
        movieId,
      }),
    };
  });

  await Ticket.insertMany(ticketsData);

  user.balance -= totalPrice;
  await user.save();

  await Payment.create({
    user: userId,
    movie: movieId,
    booking: cinemaId,
    amount: -totalPrice,
    status: "completed",
    paymentMethod: "wallet",
    description: `Seats: ${selectedSeats.map((s) => s.numbering).join(", ")}`,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, { newBalance: user.balance }, "Booking successful"),
    );
});

const handleDeposit = asyncHandler(async (req, res) => {
  const { amount } = req.body;
  const user = await User.findById(req.user.id || req.user._id);

  if (!user) throw new ApiError(404, "User not found");

  user.balance += Number(amount);
  await user.save();

  await Payment.create({
    user: user._id,
    amount: Number(amount),
    status: "completed",
    paymentMethod: "card",
    description: "Wallet Top-up via Credit Card",
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, { newBalance: user.balance }, "Deposit successful"),
    );
});

const handleHistory = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const history = await Payment.find({ user: userId })
    .populate({
      path: "movie",
      select: "title posterUrl",
    })
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, history, "Transaction history fetched"));
});

module.exports = {
  handlePayment,
  handleHistory,
  handleDeposit,
};
