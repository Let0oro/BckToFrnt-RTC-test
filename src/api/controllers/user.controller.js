const { generateKey } = require("../../utils/jwt");
const Event = require("../models/event.model");
const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
require('dotenv').config({path: '../../../.env'})

const generateAccessAndRefreshTokens = async (userID) => {
  try {
    const user = await User.findById(userID);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;

    await user.save({validateBeforeSave: false});

    return { accessToken, refreshToken };
  } catch (error) {
    throw new Error(error.message);
  }
}

const refreshAccessToken = async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) return res.status(401).json({message: "refresh token not found"})

    try {
      const decodedToken = jwt.verify(
        incomingRefreshToken, 
        process.env.REFRESH_TOKEN_SECRET
      );

      const user = await User.findById(decodedToken?._id);

      if (!user) return res.status(404).json({ message: 'User not found' });

      if (user?.refreshToken !== incomingRefreshToken) return res.status(401).json({message: 'Incorrect refresh token'});

      const options = {
        httpOnly: true,
        secure: true,
      };

      const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

      return res
        .status(200)
        .cookie('accessToken', accessToken, options)
        .cookie('refreshToken', refreshToken, options)
        .header("Authorization", accessToken)
        .json({ accessToken, refreshToken, message: 'Access token refreshed'})


    } catch (error) {
      return res.status(500).json({message: error.message})
    }
}

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
    const user = await User.findById(id).populate({path: "events._id", model: Event, select: 'title image location date description confirmed -_id'}).populate({path: "eventsSaved", model: Event, select: 'title image location date description confirmed -_id'}).lean();
    return res.status(200).json(user);
  } catch (err) {
    return res.status(400).json({message: "Error getting user by id", error: err.message});
  }
};

const register = async (req, res) => {
  const { userName, email, password } = req.body;

  if (!email || !password || !userName) return res.status(400).json({message: 'Name, Email and Password are required'});

  try {

    const existedUser = await User.findOne({email});
    if (!!existedUser) return res.status(400).json("User already exist");

    const newUser = new User({ userName, email, password, rol: "user" });
    await newUser.save();

    const createdUser = await User.findById(newUser._id).select("-password -refreshToken");

    if (!createdUser) return res.status(500).json({message: 'Something went wrong'});

    // const token = generateKey(newUser._id);
    return res.status(201)
    // .cookie("token", null, { httpOnly: true, maxAge: (2600000), sameSite: "lax" })
    // .cookie("token", token, { httpOnly: true, maxAge: (2600000), sameSite: "lax" })
    // .cookie("email", email, { httpOnly: false, maxAge: (2600000), sameSite: "lax", secure: true })
    // .cookie("userName", userName, { httpOnly: false, maxAge: (2600000), sameSite: "lax", secure: true })
    // .cookie("pass", password, { httpOnly: false, maxAge: (2600000), sameSite: "lax", secure: true })    
    .json({user: createdUser, message: 'User created succesfully!'})

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: ("Error creating user %s", error.message) });
  }
};

const login = async (req, res) => {
  const { email, password, userName } = req.body;

  if (!userName || !email || !password) 
    return res.status(400).json({message: 'Email, name and password are required'});
  
  try {

    const user = await User.findOne({ email });
    if (!!!user) return res.status(404).json({ message: "This user doesn't exists" });

    // if (bcrypt.compareSync(password, user.password)) {
    //     const token = generateKey(user._id);
    //     return res.status(200).json({ token, user })
    // }

    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) return res.status(401).json({ message: "Invalid password provided" });

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);
    // Other way:
    // const token = generateKey(user._id);

    const loggedInUser = await User.findById(user._id).select('-password -refreshToken');

    const options = { 
      httpOnly: false, 
      secure: true, 
      sameSite: 'lax', 
      resave: true, 
      maxAge: 2600000
    };


    return res
    .status(200)
    // .cookie("token", null, { ...options, resave: false, httpOnly: true })
    // .cookie("token", token, { ...options, httpOnly: true })
    // .cookie("email", email, options)
    // .cookie("userName", userName, options)
    // .cookie("pass", password, options)
    .cookie('accessToken', accessToken, { httpOnly: true, secure: true, sameSite: "lax" })
    .cookie('refreshToken', refreshToken, { httpOnly: true, secure: true, sameSite: "lax" })
    .header("Authorization", accessToken)
    .json({ 
      user: loggedInUser, 
      // token, 
      accessToken,
      refreshToken,
      message: 'Logged in successfully' 
    });


    /* Other way:
    return res
      .status(201)
      .cookie('accessToken', accessToken, options)
      .cookie('refreshtoken, refreshToken, options)
      .json({
        user: loggedInUser,
        accesstoken,
        refreshToken,
        message: 'Logged in successfully'
      })
    */
    
  } catch (error) {
    return res.status(500).json({ message: ("Error logging in %s", error.message) });
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (String(req.user._id) != String(id)) {
      return res.status(400).json({message: "You can't modify other users"});
    }

    const oldUser = await User.findById(id);
    const newUser = new User({password: oldUser.password, ...req.body});  
    newUser._id = id;
    newUser.eventsSaved = [...oldUser.eventsSaved, ...newUser.eventsSaved];
    const userUpdated = await User.findByIdAndUpdate(id, newUser, {
      new: true,
    });

    return res.status(200).json(userUpdated);
  } catch (err) {
    return res.status(400).json({message: "Error", error: err.message});
  }
};

const logoutUser = async (req, res) => {
  try{
    const { userName } = req.body;

    await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: {refreshToken: undefined}
      },
      {new: true}
    );

    // if (!!bcrypt.compareSync(password, user.password)) {
    //   return res
    //  .status(201)
    //  .cookie("token", null, { httpOnly: true, sameSite: "lax" })
    //  .json({message: `User ${user.userName} has logged out, token: ${res.cookie.token}`})
    // } else {
    //   return res.status(400).json({message: "Incorrect password"});
    // }

    return res
    .status(201)
    // .cookie("token", null, { httpOnly: true, sameSite: "lax" })
    // .cookie("email", null, { httpOnly: false, sameSite: "lax" })
    // .cookie("name", null, { httpOnly: false, sameSite: "lax" })
    // .cookie("pass", null, { httpOnly: false, sameSite: "lax" })
    .cookie("accessToken", { httpOnly: true, secure: true })
    .cookie("refreshToken", { httpOnly: true, secure: true })
    .json({message: `User ${userName} has logged out`, user: {}});

  } catch (err) {
    return res.status(400).json({message: "Error logging out", error: err.message})
  }
}

const isLoggedIn = async (req, res) => {
  const reqHeadCookies = req.headers?.cookie?.split(';').find(v => v.startsWith("accessToken="))?.split("accessToken=")[1];

  const token = reqHeadCookies || req.cookies?.accessToken;
  if (!token) {
    return res.status(401).json({ message: 'No se proporcionó token de autenticación' });
  }
  
  try {
    const decodedToken = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const userId = decodedToken._id;

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(userId);
    
    const user = await User.findById(userId).select('userName email');

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    return res
    .status(200)
    .cookie('accessToken', accessToken, { httpOnly: true, secure: true })
    .cookie('refreshToken', refreshToken, { httpOnly: true, secure: true })
    .header("Authorization", accessToken)
    .json({ user });
  } catch (error) {
    return res.status(401).json({ message: ('Token inválido o expirado %s', error.message) });
  }
};

module.exports = {
  getUsers,
  getUsersById,
  register,
  login,
  updateUser,
  logoutUser,
  refreshAccessToken,
  isLoggedIn
};
