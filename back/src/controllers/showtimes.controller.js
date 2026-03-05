const Showtime = require("../models/show.time");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/apiError");
const ApiResponse = require("../utils/apiResponse");

const getShowtimeDetails = asyncHandler(async (req, res) => {
  const { showtimeId } = req.params;
  const showtime = await Showtime.findById(showtimeId)
    .populate("movie")
    .populate({
      path: "cinema",
      populate: {
        path: "seats",
        model: "Seat",
      },
    });

  if (!showtime) {
    throw new ApiError(404, "Showtime not found");
  }

  const moviePrice = showtime.movie.price;
  const seatsWithPrice = showtime.cinema.seats.map((seat) => {
    let price;
    switch (seat.types) {
      case "VIP":
        price = moviePrice * 2.5;
        break;
      case "MEDIUM":
        price = moviePrice * 1.5;
        break;
      default:
        price = moviePrice;
    }
    return { ...seat.toObject(), price };
  });

  const showtimeWithSeatPrices = {
    ...showtime.toObject(),
    cinema: {
      ...showtime.cinema.toObject(),
      seats: seatsWithPrice,
    },
  };

  return res
    .status(200)
    .json(new ApiResponse(200, showtimeWithSeatPrices, "Showtime details fetched"));
});

module.exports = {
  getShowtimeDetails,
};
