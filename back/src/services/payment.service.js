const User = require("../models/User");
const Seat = require("../models/Seat");
const Payment = require("../models/Payment");

const processBooking = async ({
  userId,
  cinemaId,
  selectedSeats,
  totalPrice,
}) => {
  // 1. Ստուգում ենք օգտատիրոջ բալանսը
  const user = await User.findById(userId);
  if (!user || user.balance < totalPrice) {
    throw new Error("Insufficient funds or user not found");
  }

  // 2. Վերցնում ենք ID-ները
  const seatIds = selectedSeats.map((s) => s._id);

  // 3. Ստուգում ենք՝ արդյոք տեղերը արդեն զբաղված չեն
  const occupied = await Seat.find({ _id: { $in: seatIds }, status: "booked" });
  if (occupied.length > 0) {
    throw new Error("One or more seats are already booked");
  }

  // 4. Գանձում ենք գումարը
  user.balance -= totalPrice;
  await user.save();

  // 5. 🔥 ՓԱԿՈՒՄ ԵՆՔ ՏԵՂԵՐԸ (Սա է ամենակարևոր տողը)
  await Seat.updateMany(
    { _id: { $in: seatIds } },
    { $set: { status: "booked", bookedBy: userId } },
  );

  // 6. Ստեղծում ենք վճարման պատմություն
  const payment = await Payment.create({
    user: userId,
    booking: cinemaId,
    amount: totalPrice,
    status: "completed",
  });

  return {
    success: true,
    newBalance: user.balance,
    transactionId: payment.transactionId,
  };
};

module.exports = { processBooking };
