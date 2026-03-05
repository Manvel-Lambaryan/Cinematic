const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middlewares/auth.middleware");

const {
  getUsers,
  addMovie,
  updateUser,
  deleteUser,
  deleteMovie,
  getBookings,
  validateTicket,
} = require("../controllers/admin.controller");

router.use(protect);
router.use(adminOnly);

router.get("/get-users", getUsers);
router.put("/user/:id", updateUser);
router.delete("/user/:id", deleteUser);
router.post("/add-movie", addMovie);
router.delete("/movie/:id", deleteMovie);
router.get("/bookings", getBookings);
router.patch("/bookings/:id/validate", validateTicket);

module.exports = router;
