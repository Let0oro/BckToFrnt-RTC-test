const newEventSeed = require("#api/seeds/event.seed");
const { deleteImgCloudinary } = require("../../middlewares/files.middleware");
const { generateKey } = require("../../utils/jwt");
const Event = require("../models/event.model");
const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config({ path: "../../../.env" });

const checkEvents = async () => {
  const events = await Event.find();
  if (!events.length) await new Event({ ...newEventSeed }).save();
};

const getMySessionId = async (req) => {
  let currentUserId = (error = undefined);

  const reqHeadCookies = req.headers?.cookie
    ?.split(";")
    .find((v) => v.startsWith("accessToken="))
    ?.split("accessToken=")[1];

  try {
    const token = reqHeadCookies || req.cookies?.accessToken;
    if (!token) {
      error = { message: "No se proporcionó token de autenticación" };
    }
    const decodedToken = await jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET
    );
    currentUserId = decodedToken._id;
  } catch (err) {
    error = {
      message: "Ha surgido un problema con el token de autenticación",
    };
  } finally {
    return [error, currentUserId];
  }
};

const generateAccessAndRefreshTokens = async (userID) => {
  try {
    const user = await User.findById(userID);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;

    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new Error(error.message);
  }
};

const refreshAccessToken = async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken)
    return res.status(401).json({ message: "refresh token not found" });

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) return res.status(404).json({ message: "User not found" });

    if (user?.refreshToken !== incomingRefreshToken)
      return res.status(401).json({ message: "Incorrect refresh token" });

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
      user._id
    );

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .header("Authorization", accessToken)
      .json({ accessToken, refreshToken, message: "Access token refreshed" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().lean();
    return res.status(200).json(users);
  } catch (err) {
    res.status(400).json({ messaje: "Error getting users", error: err });
  }
};

const getUsersById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id)
      .populate({
        path: "events._id",
        model: Event,
        select: "title image location date description confirmed -_id",
      })
      .populate({
        path: "eventsSaved",
        model: Event,
        select: "title image location date description confirmed -_id",
      })
      .lean();
    return res.status(200).json(user);
  } catch (err) {
    return res
      .status(400)
      .json({ message: "Error getting user by id", error: err.message });
  }
};

const register = async (req, res) => {
  const { userName, email, password } = req.body;

  if (!email || !password || !userName)
    return res
      .status(400)
      .json({ message: "Email, name and password are required" });

  try {
    const existedUser = await User.findOne({ email });
    if (!!existedUser) return res.status(400).json("User already exist");

    const newUser = new User({
      userName,
      email,
      password,
      rol: req.body.rol || "user",
    });
    await newUser.save();

    const createdUser = await User.findById(newUser._id).select(
      "-password -refreshToken"
    );

    if (!createdUser)
      return res.status(500).json({ message: "Something went wrong" });

    await checkEvents();

    // const options = {
    //   httpOnly: false,
    //   secure: true,
    //   sameSite: "lax",
    //   resave: true,
    //   maxAge: 2600000,
    // };

    // const token = generateKey(newUser._id);
    return (
      res
        .status(201)
        // .cookie("token", null, { httpOnly: true, maxAge: (2600000), sameSite: "lax" })
        // .cookie("token", token, { httpOnly: true, maxAge: (2600000), sameSite: "lax" })
        // .cookie("email", email, { httpOnly: false, maxAge: (2600000), sameSite: "lax", secure: true })
        // .cookie("userName", userName, { httpOnly: false, maxAge: (2600000), sameSite: "lax", secure: true })
        // .cookie("pass", password, { httpOnly: false, maxAge: (2600000), sameSite: "lax", secure: true })
        .json({ user: createdUser, message: "User created succesfully!" })
    );
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: ("Error creating user %s", error.message) });
  }
};

const login = async (req, res) => {
  const { email, password, userName } = req.body;

  if (!userName || !email || !password)
    return res
      .status(400)
      .json({ message: "Email, name and password are required" });

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "This user doesn't exists" });

    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword)
      return res.status(401).json({ message: "Invalid password provided" });

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
      user._id
    );

    const loggedInUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );

    await checkEvents();

    return res
      .status(200)
      .cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
      })
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
      })
      .header("Authorization", accessToken)
      .json({
        user: loggedInUser,
        accessToken,
        refreshToken,
        message: "Logged in successfully",
      });
  } catch (error) {
    return res
      .status(500)
      .json({ message: ("Error logging in %s", error.message) });
  }
};

const addEventsUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (String(req.user._id) != String(id)) {
      return res
        .status(400)
        .json({ message: "You can't modify other user's events" });
    }

    const oldUser = await User.findById(id);
    const newUser = new User({ password: oldUser.password, ...req.body });
    newUser._id = id;
    newUser.eventsSaved = [...oldUser.eventsSaved, ...newUser.eventsSaved];
    const userUpdated = await User.findByIdAndUpdate(id, newUser, {
      new: true,
    });

    return res.status(200).json(userUpdated);
  } catch (err) {
    return res.status(400).json({ message: "Error", error: err.message });
  }
};

const updateUser = async (req, res, next) => {
  try {
    const [error, id] = await getMySessionId(req);
    if (error) return res.status(401).json(error);

    const oldUser = await User.findById(id);

    if (!oldUser) {
      return res
        .status(404)
        .json({ message: "Fatal error, this account doesn't exists" });
    }

    const { password, eventsSaved } = oldUser;
    const newUser = new User({ ...req.body, password, eventsSaved, _id: id });
    const userUpdated = await User.findByIdAndUpdate(id, newUser, {
      new: true,
    });

    return res.status(200).json(userUpdated);
  } catch (err) {
    return res.status(400).json({ message: "Error", error: err.message });
  }
};

const logoutUser = async (req, res) => {
  const reqHeadCookies = req.headers?.cookie
    ?.split(";")
    .find((v) => v.startsWith("accessToken="))
    ?.split("accessToken=")[1];

  const token = reqHeadCookies || req.cookies?.accessToken;
  if (!token) {
    return res
      .status(401)
      .json({ message: "No se proporcionó token de autenticación" });
  }

  try {
    const decodedToken = await jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET
    );

    const userId = decodedToken._id;

    const { userName } = await User.findByIdAndUpdate(
      userId,
      {
        $set: { refreshToken: undefined },
      },
      { new: true }
    );

    // if (!!bcrypt.compareSync(password, user.password)) {
    //   return res
    //  .status(201)
    //  .cookie("token", null, { httpOnly: true, sameSite: "lax" })
    //  .json({message: `User ${user.userName} has logged out, token: ${res.cookie.token}`})
    // } else {
    //   return res.status(400).json({message: "Incorrect password"});
    // }

    return (
      res
        .status(201)
        // .cookie("token", null, { httpOnly: true, sameSite: "lax" })
        // .cookie("email", null, { httpOnly: false, sameSite: "lax" })
        // .cookie("name", null, { httpOnly: false, sameSite: "lax" })
        // .cookie("pass", null, { httpOnly: false, sameSite: "lax" })
        .cookie("accessToken", null, { maxAge: 0 })
        .cookie("refreshToken", null, { maxAge: 0 })
        .json({ message: `User ${userName} has logged out`, user: {} })
    );
  } catch (err) {
    return res
      .status(400)
      .json({ message: "Error logging out", error: err.message });
  }
};

const isLoggedIn = async (req, res) => {
  try {
    const [error, userId] = await getMySessionId(req);
    if (error) return res.status(401).json(error);

    const { accessToken, refreshToken } =
      await generateAccessAndRefreshTokens(userId);

    const user = await User.findById(userId).select("userName email rol");

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    return res
      .status(200)
      .cookie("accessToken", accessToken, { httpOnly: true, secure: true })
      .cookie("refreshToken", refreshToken, { httpOnly: true, secure: true })
      .header("Authorization", accessToken)
      .json({ user });
  } catch (error) {
    return res
      .status(401)
      .json({ message: ("Token inválido o expirado %s", error.message) });
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params;

  const [error, currentUserId] = await getMySessionId(req);
  if (error) return res.status(401).json(error);

  try {
    const currentUser = await User.findById(currentUserId).select("rol");
    const user = await User.findById(id);

    if (!user)
      return res.status(404).json({ message: "This user doesn't exists" });

    const { eventsSaved, events } = user;

    const removeEventsUser = async (eventID) => {
      const event = await Event.findById(eventID);
      if (!event)
        return res.status(404).json("Unauthorized deleting events user");
      const { attendees: oldAttendees, confirmed: oldConfirmed } = event;
      const newAttendees = oldAttendees.filter(
        (userID) => String(userID) != String(id)
      );
      const newConfirmed = oldConfirmed.filter(
        (userID) => String(userID) != String(id)
      );
      await Event.findByIdAndUpdate(eventID, {
        $set: {
          attendees: newAttendees,
          confirmed: newConfirmed,
        },
      });
    };

    eventsSaved.forEach(async (eventID) => await removeEventsUser(eventID));
    events.forEach(async (eventID) => await removeEventsUser(eventID));

    if (id != currentUserId && currentUser.rol != "admin")
      return res.status(401).json({ message: "Unauthorized" });
    await User.findByIdAndDelete(id);
    return res
      .status(201)
      .json({ message: `User ${user.email} has been deleted` });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: ("Error deleting user %s", error.message) });
  }
};

const promoteUser = async (req, res) => {
  const { id } = req.params;

  const [error, currentUserId] = await getMySessionId(req);
  if (error) return res.status(401).json(error);

  try {
    const currentUser = await User.findById(currentUserId).select("rol");
    const user = await User.findById(id);

    if (!user)
      return res.status(404).json({ message: "This user doesn't exists" });

    const { rol: userRol } = user;

    if (currentUser.rol != "admin")
      return res.status(401).json({ message: "Unauthorized" });

    const newUser = await User.findByIdAndUpdate(id, { $set: { rol: (userRol == "admin" ? "user" : "admin") }}, {new: true});
    return res
      .status(201)
      .json({ message: `User ${user.userName} has been promoted to ${newUser.rol}` });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: ("Error promoting user %s", error.message) });
  }

};

module.exports = {
  getUsers,
  getUsersById,
  register,
  login,
  updateUser,
  addEventsUser,
  logoutUser,
  refreshAccessToken,
  isLoggedIn,
  deleteUser,
  getMySessionId,
  promoteUser,
};
