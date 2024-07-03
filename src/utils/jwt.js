const jwt = require("jsonwebtoken");
// const { verifyKey } = require("../utils/jwt");
require("dotenv").config();

const SECRET_KEY = process.env.SECRET_KEY;

const generateKey = (userId) => {
  return jwt.sign({ userId }, SECRET_KEY, { expiresIn: "1h" });
};

const verifyKey = (token) => {
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    return { userId: decoded.userId };
  } catch (error) {
    console.error(error);
    return null;
  }
};

module.exports = { generateKey, verifyKey };
