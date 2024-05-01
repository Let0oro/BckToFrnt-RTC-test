const isAuth = require("../../middlewares/auth");

const {
    getUsers,
    getUsersById,
    register,
    login,
    updateUser,
    logoutUser,
} = require("../controllers/user.controller.js");

const userRouter = require("express").Router();

userRouter.get("/", getUsers);
userRouter.get("/:id", getUsersById);
userRouter.post("/register", register);
userRouter.post("/login", login);
userRouter.put("/:id", isAuth, updateUser);
userRouter.post("/logout", isAuth, logoutUser);

module.exports = userRouter;