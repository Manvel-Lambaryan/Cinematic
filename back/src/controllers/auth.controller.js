const authService = require("../services/auth.service");

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const result = await authService.register(name, email, password);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);

    res.json(result);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

const user = async (req, res) => {
  try {
    const userId = req.user.id;
    const currentUser = await authService.getUserById(userId);
    res.json(currentUser);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

const deposit = async (req, res) => {
  try {
    const { userId, amount } = req.body;
    const user = await authService.findById(userId);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    user.balance += Number(amount);
    await user.save();

    res.status(200).json({
      success: true,
      newBalance: user.balance,
      message: "Deposit successful",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { register, login, user, deposit };
