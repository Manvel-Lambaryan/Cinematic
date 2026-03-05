const User = require("../models/User");
const Movie = require("../models/Movie");
const Ticket = require("../models/Ticket");

const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").lean();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

const addMovie = async (req, res) => {
  try {
    const newMovie = new Movie(req.body);
    await newMovie.save();
    res.status(201).json({
      message: "Movie added to database successfully",
      data: newMovie,
    });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error adding movie", error: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found..." });
    }

    res.status(200).json({
      message: "User data updated successfully...",
      data: updatedUser,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found..." });
    }
    res.status(200).json({ message: "User deleted Successfully..." });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

const deleteMovie = async (req, res) => {
  try {
    const deletedMovie = await Movie.findByIdAndDelete(req.params.id);
    if (!deletedMovie) {
      return res.status(404).json({ message: "Movie not found..." });
    }
    res.status(200).json({ message: "Movie deleted successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getBookings = async (req, res) => {
  try {
    const bookings = await Ticket.find()
      .populate('user', 'name email')
      .populate('movie', 'title')
      .populate('cinema', 'name')
      .populate('seat', 'numbering types x y')
      .sort({ createdAt: -1 });
    
    res.status(200).json(bookings);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

const validateTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { status: 'used' },
      { new: true, runValidators: true }
    ).populate('user', 'name email')
     .populate('movie', 'title');

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found..." });
    }

    res.status(200).json({
      message: "Ticket validated successfully",
      data: ticket
    });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

module.exports = {
  getUsers,
  addMovie,
  updateUser,
  deleteUser,
  deleteMovie,
  getBookings,
  validateTicket,
};
