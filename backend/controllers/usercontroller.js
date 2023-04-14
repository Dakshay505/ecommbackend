const catchasyncerror = require("../middleware/catchasyncerror");
const ErrorHandler = require("../utils/errorhandler");
const User = require("../models/userModel");
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");
const cloudinary = require("cloudinary");

// Register a user
exports.registerUser = catchasyncerror(async (req, res, next) => {
  const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
    folder: "avatars",
    width: 150,
    crop: "scale",
  });

  const { name, email, password } = req.body;

  const user = await User.create({
    name,
    email,
    password,
    avatar: {
      public_id: myCloud.public_id,
      url: myCloud.secure_url,
    },
  });

  sendToken(user, 201, res);
});

// login a user
exports.loginUser = catchasyncerror(async (req, resp, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password");
  // checking if user not filled both column
  if (!email || !password) {
    return next(
      new ErrorHandler("Please Enter a valid Email or Password ", 400)
    );
  }

  if (!user) {
    return next(
      new ErrorHandler("Please Enter a valid Email or Password ", 401)
    );
  }

  const isPasswordMatched = await user.comparePassword(password);

  if (!isPasswordMatched) {
    return next(
      new ErrorHandler("Please Enter a valid Email or Password ", 401)
    );
  }

  sendToken(user, 200, resp);
});

// Logout function
exports.logoutUser = catchasyncerror(async (req, resp, next) => {
  resp.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });
  resp.status(200).json({
    success: true,
    message: "You are logged out now",
  });
});

// Forget password
exports.forgetPassword = catchasyncerror(async (req, resp, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorHandler("User not found .", 404));
  }
  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  // now we are creating a reset url which we are going to send in the mail
  const resetUrl = `${process.env.FRONTEND_URL}/password/reset/${resetToken}`;

  const message = `Your passwoord reset url : \n\n ${resetUrl} \n
  if you not requested for it then please ignore it .`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Ecomm password recovery",
      message,
    });

    resp.status(200).json({
      success: true,
      message: `Email sent to ${user.email} .`,
    });
  } catch (error) {
    user.resetPasswordExpire = undefined;
    user.resetPasswordToken = undefined;

    await user.save({ validateBeforeSave: false });
    return next(new ErrorHandler(error.message), 500);
  }
});
// reset password
exports.resetPassword = catchasyncerror(async (req, resp, next) => {
  // creating token hash
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken: resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });
  if (!user) {
    return next(
      new ErrorHandler("Reset token has been incorrect or Expired .", 400)
    );
  }
  if (req.body.password !== req.body.confirmPassword) {
    return next(new ErrorHandler("Password doen't matched .", 400));
  }

  user.password = req.body.password;
  user.resetPasswordExpire = undefined;
  user.resetPasswordToken = undefined;

  await user.save();
  sendToken(user, 200, resp);
});

// Get User details
exports.getUserDetails = catchasyncerror(async (req, resp, next) => {
  const user = await User.findById(req.user.id);
  resp.status(200).json({
    success: true,
    user,
  });
});
// Update password
exports.updatePassword = catchasyncerror(async (req, resp, next) => {
  const user = await User.findById(req.user.id).select("+password");

  const isPasswordMatched = await user.comparePassword(req.body.oldPassword);
  if (!isPasswordMatched) {
    return next(new ErrorHandler("Please Enter correct Password ", 400));
  }
  if (req.body.password !== req.body.confirmPassword) {
    return next(new ErrorHandler("Password doen't matched.", 400));
  }

  user.password = req.body.password;
  user.resetPasswordExpire = undefined;
  user.resetPasswordToken = undefined;

  await user.save();
  sendToken(user, 200, resp);
});

// Update user details
exports.updateDetails = catchasyncerror(async (req, resp, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
  };

  if (req.body.avatar !== "") {
    const user = await User.findById(req.user.id);
    const imageId = user.avatar.public_id;

    await cloudinary.v2.uploader.destroy(imageId);

    const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
      folder: "avatars",
      width: 150,
      crop: "scale",
    });
    newUserData.avatar = {
      public_id: myCloud.public_id,
      url: myCloud.secure_url,
    };
  }
  const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });
  await user.save();
  resp.status(200).json({
    success: true,
    message: "User data has been updated",
    user,
  });
});

// get all user details (admin)
exports.getALlUsers = catchasyncerror(async (req, resp, next) => {
  const users = await User.find();

  resp.status(200).json({
    success: true,
    users,
  });
});

// get single user details (admin)
exports.getSingleUserDetails = catchasyncerror(async (req, resp, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorHandler(`User does not exist id: ${req.params.id} `, 404)
    );
  }
  resp.status(200).json({
    success: true,
    user,
  });
});

// update user role (admin)
exports.updateRole = catchasyncerror(async (req, resp, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
  };
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new ErrorHandler(`User not found id: ${req.params.id} .`, 404));
  }
  await user.update(newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });
  await user.save();
  resp.status(200).json({
    success: true,
    message: "User data has been updated",
    user,
  });
});
// delete user (admin)
exports.deleteUser = catchasyncerror(async (req, resp, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new ErrorHandler(`User not found id: ${req.params.id} .`, 404));
  }
  // we will remove cloudinary
  await user.remove();
  resp.status(200).json({
    success: true,
    message: "user has been deleted.",
  });
});
