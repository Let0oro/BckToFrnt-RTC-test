const jwt = require("jsonwebtoken");
const User = require("../api/models/user.model");

const getMyAuthSessionUser = async (req, res) => {

  let user = error = null;

  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (!token) error = { message: "Token not found" };

  try {
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );

    if (!user) error = { message: "User not found at verifyJWT function" };

    return user;
  } catch (err) {
     error = { message: err.message };
  } finally {
    return [error, user];
  }
};

const isAdmin = async (req, res, next) => {
  try {
    const [error, user] = await getMyAuthSessionUser(req, res);
    if (error) return res.status(400).json(error)

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
    const [error, user] = await getMyAuthSessionUser(req, res);
    if (error) return res.status(400).json(error)

    req.user = user;
    next();
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports = { verifyJWT, isAdmin };
