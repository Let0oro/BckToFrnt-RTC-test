const User = require("../api/models/user.model");
const { verifyKey } = require("../utils/jwt");

const isAuth = async (req, res, next) => {
  try {
    if (!!!req.cookies?.token || req.cookies?.token?.endsWith("null")) {
      return res.status(401).json({
        message: "Unauthorized.",
        error: "Login token not provided",
      });
    }
    const tokenCookies = req.cookies.token;

    const { userId } = verifyKey(tokenCookies);

    if (!userId) {
      return res.status(401).json({ message: "Invalid token" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.password = null;
    req.user = user;
    next();
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error verifying token", error: error.message });
  }
};

module.exports = isAuth;
