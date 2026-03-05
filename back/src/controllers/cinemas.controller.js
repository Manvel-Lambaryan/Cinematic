const Cinema = require("../models/Cinema");
const Seat = require("../models/Seat");
const Ticket = require("../models/Ticket");
const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/apiResponse");
const ApiError = require("../utils/apiError");
const translate = require("@vitalets/google-translate-api"); // 1. Ներմուծում ենք translate-ը

// Caching օբյեկտ Cinema-ների համար
const cinemaCache = {};

// 1. Ստանալ կոնկրետ դահլիճը (Թարգմանված)
const getCinemaById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { movieId, lang = "en" } = req.query; // Ստանում ենք լեզուն query-ից

  const cinema = await Cinema.findById(id).populate("seats");
  if (!cinema) {
    throw new ApiError(404, "Cinema not found");
  }

  let bookedSeatIds = [];
  if (movieId) {
    const bookedTickets = await Ticket.find({ movie: movieId });
    bookedSeatIds = bookedTickets.map((t) => t.seat.toString());
  }

  const seatsWithStatus = cinema.seats.map((seat) => {
    const seatObj = seat.toObject();
    return {
      ...seatObj,
      isBooked: bookedSeatIds.includes(seat._id.toString()),
    };
  });

  let cinemaData = {
    ...cinema.toObject(),
    seats: seatsWithStatus,
  };

  // Թարգմանության տրամաբանություն
  if (lang !== "en") {
    const cacheKey = `cinema_${id}_${lang}`;
    if (cinemaCache[cacheKey]) {
      cinemaData.numbering = cinemaCache[cacheKey];
    } else {
      try {
        // Թարգմանում ենք դահլիճի անունը/համարը (օրինակ՝ "Hall 1" -> "Դահլիճ 1")
        const { text } = await translate(cinemaData.numbering, { to: lang });
        cinemaCache[cacheKey] = text;
        cinemaData.numbering = text;
      } catch (err) {
        console.error("Translation error:", err);
      }
    }
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        cinemaData,
        "Cinema fetched with dynamic seat status",
      ),
    );
});

// 2. Ստեղծել նոր դահլիճ
const createCinema = asyncHandler(async (req, res) => {
  const { numbering, totalSeats, customSeats, basePrice = 0 } = req.body;

  const existingCinema = await Cinema.findOne({ numbering });
  if (existingCinema) {
    throw new ApiError(400, `Cinema ${numbering} already exists`);
  }

  let seatsToCreate = [];
  if (customSeats && Array.isArray(customSeats) && customSeats.length > 0) {
    seatsToCreate = customSeats.map((seat) => ({
      ...seat,
      price:
        seat.price !== undefined
          ? seat.price
          : seat.types === "VIP"
            ? basePrice * 1.5
            : basePrice,
    }));
  } else if (totalSeats) {
    for (let i = 1; i <= totalSeats; i++) {
      const type = i <= 10 ? "VIP" : "NORMAL";
      seatsToCreate.push({
        numbering: i,
        types: type,
        status: "available",
        x: Math.floor((i - 1) / 10),
        y: (i - 1) % 10,
        price: type === "VIP" ? basePrice * 1.5 : basePrice,
      });
    }
  } else {
    throw new ApiError(400, "Please provide seat layout or total seat count");
  }

  const createdSeats = await Seat.insertMany(seatsToCreate);
  const seatIds = createdSeats.map((seat) => seat._id);

  const cinema = await Cinema.create({
    numbering,
    seats: seatIds,
  });

  return res
    .status(201)
    .json(
      new ApiResponse(201, cinema, "Cinema created with seats successfully"),
    );
});

// 3. Bulk Seats (Անփոփոխ)
const createSeatsInBulk = asyncHandler(async (req, res) => {
  const { cinemaId } = req.params;
  const { seats, basePrice = 0 } = req.body;

  if (!Array.isArray(seats) || seats.length === 0) {
    throw new ApiError(400, "Seats data must be a non-empty array.");
  }

  const formattedSeats = seats.map((seat) => ({
    ...seat,
    x: Number(seat.x),
    y: Number(seat.y),
    price:
      seat.price !== undefined
        ? seat.price
        : seat.types === "VIP"
          ? basePrice * 1.5
          : basePrice,
  }));

  const newSeats = await Seat.insertMany(formattedSeats);
  const newSeatIds = newSeats.map((seat) => seat._id);

  await Cinema.findByIdAndUpdate(
    cinemaId,
    { $push: { seats: { $each: newSeatIds } } },
    { new: true, useFindAndModify: false },
  );

  return res
    .status(201)
    .json(new ApiResponse(201, newSeats, "Seats added successfully."));
});

// 4. Ստանալ բոլոր դահլիճները (Թարգմանված)
const getAllCinemas = asyncHandler(async (req, res) => {
  const cinemas = await Cinema.find().populate("seats");
  const lang = req.query.lang || "en";

  if (lang === "en") {
    return res
      .status(200)
      .json(new ApiResponse(200, cinemas, "Cinemas fetched"));
  }

  // Թարգմանում ենք բոլոր դահլիճների անունները
  const translatedCinemas = await Promise.all(
    cinemas.map(async (cinema) => {
      const cinemaObj = cinema.toObject();
      const cacheKey = `cinema_${cinema._id}_${lang}`;

      if (cinemaCache[cacheKey]) {
        cinemaObj.numbering = cinemaCache[cacheKey];
      } else {
        try {
          const { text } = await translate(cinemaObj.numbering, { to: lang });
          cinemaCache[cacheKey] = text;
          cinemaObj.numbering = text;
        } catch (err) {
          // Error-ի դեպքում թողնում ենք նույնը
        }
      }
      return cinemaObj;
    }),
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        translatedCinemas,
        "Cinemas fetched with translation",
      ),
    );
});

// 5. Ջնջել (Ավելացրել եմ Cache-ի մաքրում)
const deleteCinema = asyncHandler(async (req, res) => {
  const cinema = await Cinema.findById(req.params.id);
  if (!cinema) throw new ApiError(404, "Cinema not found");

  // Մաքրում ենք Cache-ը
  Object.keys(cinemaCache).forEach((key) => {
    if (key.includes(req.params.id)) delete cinemaCache[key];
  });

  await Seat.deleteMany({ _id: { $in: cinema.seats } });
  await cinema.deleteOne();

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Cinema and seats deleted"));
});

module.exports = {
  createCinema,
  getAllCinemas,
  deleteCinema,
  getCinemaById,
  createSeatsInBulk,
};
