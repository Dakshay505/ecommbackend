const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter your name ."],
    maxLength: [
      50,
      "Maximum length of your name should be less than 50 characters .",
    ],
    minLength: [
      4,
      "Maximum length of your name should be less than 4 characters .",
    ],
  },
  email: {
    type: String,
    required: [true, "Please enter your name ."],
    unique: true,
    validator: [validator.isEmail, "Please enter a valid mail Id ."],
  },
  password: {
    type: String,
    required: [true, "Please enter your password ."],
    select: false, // it means when we get all data in find() we don't show password
    minLength: [8, "Password should be more than 8 characters ."],
  },
  avatar: {
    public_id: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },
  role: {
    type: String,
    default: "User",
  },
  createdAt:{
   type:Date,
   default:Date.now,
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
});
// using bcryptjs for securing our password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }

  this.password = await bcrypt.hash(this.password, 10);
});

// JWT token
userSchema.methods.getJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_TOKEN, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};
// comparing password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generating password reset token
userSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");

  //Hashing and adding reset password token to UserSchema
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Now setting the time for token
  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

  return resetToken;
};

module.exports = mongoose.model("user", userSchema);
