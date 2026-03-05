const express = require("express");
const router = express.Router();

const {
  handlePayment,
  handleHistory,
  handleDeposit
} = require("../controllers/payments.controller");

const { protect } = require("../middlewares/auth.middleware");

router.post("/process", protect, handlePayment);

router.post("/deposit", protect, handleDeposit);

router.get("/history/:userId", protect, handleHistory);

module.exports = router;
