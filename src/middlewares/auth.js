// const { verifyKey } = require("../utils/jwt");
const jwt = require("jsonwebtoken");
const User = require("../api/models/user.model");

// const isAuth = async (req, res, next) => {
//   try {
//     if (!!!req.cookies?.token || req.cookies?.token?.endsWith("null")) {
//       return res.status(401).json({
//         message: "Unauthorized.",
//         error: "Login token not provided",
//       });
//     }
//     const tokenCookies = req.cookies.token;

//     const { userId } = verifyKey(tokenCookies);

//     if (!userId) {
//       return res.status(401).json({ message: "Invalid token" });
//     }

//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     user.password = null;
//     req.user = user;
//     next();
//   } catch (error) {
//     console.error(error);
//     res
//       .status(500)
//       .json({ message: "Error verifying token", error: error.message });
//   }
// };

const verifyJWT = async (req, res, next) => {
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

    req.user = user;
    next();
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// module.exports = isAuth;
module.exports = verifyJWT;
