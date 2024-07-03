const verifyJWT = require("../../middlewares/auth");
const isAuth = require("../../middlewares/auth");
const {
    getUsers,
    getUsersById,
    register,
    login,
    updateUser,
    logoutUser,
    refreshAccessToken,
    isLoggedIn
} = require("../controllers/user.controller.js");

const userRouter = require("express").Router();

userRouter.get("/", getUsers);
userRouter.get("/is_logged_in", isLoggedIn);
userRouter.get("/:id", getUsersById);
userRouter.post("/register", register); // Other way: userRouter.route('/register').post(register);
userRouter.post("/login", login);
userRouter.put("/add_event/:id", verifyJWT, updateUser);
// userRouter.post("/logout", isAuth, logoutUser);

// Or
userRouter.route('/refresh-token').post(refreshAccessToken)
userRouter.route('/logout').post(verifyJWT, logoutUser)

module.exports = userRouter;