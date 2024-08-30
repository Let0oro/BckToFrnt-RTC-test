const { verifyJWT, isAdmin } = require("../../middlewares/auth");
const { userUpload } = require("../../middlewares/files.middleware.js");
const {
  getUsers,
  getUsersById,
  register,
  login,
  updateUser,
  addEventsUser,
  logoutUser,
  isLoggedIn,
  chooseForAdmin,
  deleteUser,
  promoteUser
} = require("../controllers/user.controller.js");

const userRouter = require("express").Router();

userRouter.get("/", getUsers);
userRouter.get("/is_logged_in", isLoggedIn);
userRouter.get("/:id", getUsersById);
userRouter.post("/register", register);
userRouter.post("/login", login);
userRouter.post("/logout", logoutUser);
userRouter.put("/promote", verifyJWT, promoteUser);
userRouter.put("/update", [verifyJWT, userUpload.single("image")], updateUser);
userRouter.put("/admin/:id", [verifyJWT, isAdmin], chooseForAdmin);
userRouter.put("/add_event/:id", verifyJWT, addEventsUser);
userRouter.delete("/delete/:id", verifyJWT, deleteUser);


module.exports = userRouter;
