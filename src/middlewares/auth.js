const jwt = require("jsonwebtoken");
const User = require("../api/models/user.model");

const getMyAuthSessionUser = async (req, res) => {

  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (!token) return res.status(401).json({ message: "Token not found" });

  try {
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );

    if (!user)
      return res
        .status(404)
        .json({ message: "User not found at verifyJWT function" });

    return user;
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const isAdmin = async (req, res, next) => {
  try {
    const user = await getMyAuthSessionUser(req, res);

    if (!user) return res.status(404).json({message: "The user hasnt been founded"})

    if (user.rol != "admin") {
      return res
        .status(401)
        .json({ message: "You are not an admin, unauthorized!" });
    }
    next();
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const verifyJWT = async (req, res, next) => {

  try {
    const user = await getMyAuthSessionUser(req, res)

    req.user = user;
    next();
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports = { verifyJWT, isAdmin };
