const jwt = require("jsonwebtoken");
const env = require("../config/env");

const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

  if (!token) {
    return res.status(401).json({ message: "Invalid Token. Access Denied." });
  }

  try {
    const decoded = jwt.verify(token, env.jwt.accessSecret);
    
    req.user = decoded;
    
    next();
  } catch (err) {
    return res.status(401).json({ error: "Token Failed or Expired" });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Forbidden: Admin access only" });
  }
};

module.exports = {
  protect,
  adminOnly,
};