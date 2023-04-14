const ErrorHandler = require("../utils/errorhandler");
const catchasyncerror = require("./catchasyncerror");
const jwt = require('jsonwebtoken');
const User = require("../models/userModel");

exports.isAuthenticatedUser = catchasyncerror(async (req, resp, next) => {

    const { token } = req.cookies;

    if (!token) {
        return next(new ErrorHandler("Please login to access this resourse .", 401));
    }
    // if we get the token first we decode the token So we are importing JWT 
    const decodedData = jwt.verify(token, process.env.JWT_TOKEN);

    // Now we import our Model 
    req.user = await User.findById(decodedData.id);

    next();

})

// role admin  
exports.authorizeRole = (...roles) => {
    return (req, resp, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new ErrorHandler(`${req.user.role} is not Authorized to access this `, 403));
        };
        next();

    };
};