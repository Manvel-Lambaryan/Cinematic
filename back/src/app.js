const express = require("express");
const cors = require("cors");
const path = require("path");
const morgan = require("morgan");

const authRoutes = require("./routes/auth.routes");
const adminRoutes = require("./routes/admin.routes");
const movieRoutes = require("./routes/movies.routes");
const cinemaRoutes = require("./routes/cinemas.routes");
const showtimeRoutes = require("./routes/showtimes.routes");
const paymentRoutes = require('./routes/payments.routes')// 1. Import Payment Route

const corsOptions = require("./config/cors");
 
const app = express();
 
app.use(morgan("dev"));
app.use(cors(corsOptions));
app.use(express.json());

app.use(
  "/uploads", 
  express.static(path.join(process.cwd(), "public", "uploads")),
);

// 2. Register Routes
app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/movie", movieRoutes);
app.use("/cinema", cinemaRoutes);
app.use("/showtime", showtimeRoutes);
app.use("/payments", paymentRoutes); // 3. Add Payment Route

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Something went wrong!",
  });
});

module.exports = app;
