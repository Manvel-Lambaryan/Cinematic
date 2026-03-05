const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const { protect } = require("../middlewares/auth.middleware");
const { googleLogin } = require('../controllers/google.controller')

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get('/user', protect, authController.user); 
router.post("/google-login", googleLogin);
router.post("/deposit", protect, authController.deposit);

module.exports = router;