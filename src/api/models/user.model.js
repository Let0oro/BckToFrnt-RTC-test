const { default: mongoose } = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema(
  {
    userName: { type: String, required: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    refreshToken: { type: String },

    eventsSaved: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],
    events: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],
    rol: {
      type: String,
      required: true,
      default: "user",
      enum: ["admin", "user"],
    },
  },
  {
    timestamps: true,
    collection: "users",
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = bcrypt.hashSync(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: '15m',
    }
  )
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: '15d'
    }
  )
}

const User = mongoose.model("User", userSchema);
module.exports = User;
