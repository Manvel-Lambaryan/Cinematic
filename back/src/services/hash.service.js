const bcrypt = require("bcrypt");
const env = require("../config/env");

const hashPassword = async (password) => {
  return await bcrypt.hash(password, env.bcryptSalt);
};

const comparePassword = async (password, hash) => {
  if (!password || !hash) {
    console.error("BCRYPT ERROR: Missing data or hash!", {
      hasPassword: !!password,
      hasHash: !!hash,
    });
    throw new Error("Data and hash arguments required for comparison");
  }
  return await bcrypt.compare(password, hash);
};

module.exports = {
  hashPassword,
  comparePassword,
};
