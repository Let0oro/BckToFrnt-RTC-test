const { generateKey } = require("../../utils/jwt");
const Event = require("../models/event.model");
const User = require("../models/user.model");
const bcrypt = require("bcrypt");

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
    const user = await User.findById(id).populate({path: "events", model: Event, select: 'title image location date description confirmed -_id'}).lean();
    return res.status(200).json(user);
  } catch (err) {
    return res.status(400).json({message: "Error getting user by id", error: err.message});
  }
};

const register = async (req, res) => {
  try {
    const { userName, email, password } = req.body;

    const userDuplicated = await User.findOne({email});

    if (!!userDuplicated) {
        return res.status(400).json("User already exist");
    }

    const newUser = new User({ userName, email, password, rol: "user" });
    await newUser.save();

    const token = generateKey(newUser._id);
    res.cookie("token", null, { httpOnly: true, maxAge: (2600000), sameSite: "lax" });
    res.cookie("token", token, { httpOnly: true, maxAge: (2600000), sameSite: "lax" });
    res.cookie("email", email, { httpOnly: false, maxAge: (2600000), sameSite: "lax", secure: true });
    res.cookie("userName", user.userName, { httpOnly: false, maxAge: (2600000), sameSite: "lax", secure: true });
    res.cookie("pass", password, { httpOnly: true, maxAge: (2600000), sameSite: "lax", secure: true });    res.status(201).json({ user: newUser, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating user" });
  }
};


const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!!!user) {
      return res.status(401).json({ message: "This user doesn't exists" });
    }

    console.log("RESPONSE: ", res.cookie)

    // if (bcrypt.compareSync(password, user.password)) {
    //     const token = generateKey(user._id);
    //     return res.status(200).json({ token, user })
    // }

    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid password provided" });
    }


    const token = generateKey(user._id);
    res.cookie("token", null, { httpOnly: true, maxAge: (2600000), sameSite: "lax" });
    res.cookie("token", token, { httpOnly: true, maxAge: (2600000), sameSite: "lax", resave: true });
    res.cookie("email", email, { httpOnly: false, maxAge: (2600000), sameSite: "lax", resave: true });
    res.cookie("userName", user.userName, { httpOnly: false, maxAge: (2600000), sameSite: "lax", resave: true });
    res.cookie("pass", password, { httpOnly: false, maxAge: (2600000), sameSite: "lax", resave: true });
    res.status(200).json({ user, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error logging in" });
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
    newUser.favs = [...oldUser.favs, ...newUser.favs];
    const userUpdated = await User.findByIdAndUpdate(id, newUser, {
      new: true,
    });

    return res.status(200).json(userUpdated);
  } catch (err) {
    return res.status(400).json({message: "Error", error: err.message});
  }
};

const logoutUser = async (req, res, next) => {
  try{
    const { email } = req.body;

    console.log(req.body)
    const user = await User.findOne({email});
    console.log(user)
    if (!user) return res.status(404).json({message: "User not found"})
    // if (!!bcrypt.compareSync(password, user.password)) {
    //   res.cookie("token", null, { httpOnly: true, sameSite: "lax" });
    //   return res.status(201).json({message: `User ${user.userName} has logged out, token: ${res.cookie.token}`})
    // } else {
    //   return res.status(400).json({message: "Incorrect password"});
    // }
    res.cookie("token", null, { httpOnly: true, sameSite: "lax" });
    return res.status(201).json({message: `User ${user.userName} has logged out, token: ${res.cookie.token}`})


  } catch (err) {
    return res.status(400).json({message: "Error logging out", error: err.message})
  }
}

module.exports = {
  getUsers,
  getUsersById,
  register,
  login,
  updateUser,
  logoutUser,
};
