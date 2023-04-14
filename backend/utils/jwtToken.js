// creating a token and saving in cookies

const sendToken = (user, statuscode, resp) => {
  const jwtToken = user.getJwtToken();

  // options for cookies
  const options = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,

  };
  resp.status(statuscode).cookie("token",jwtToken,options).json({
    success: true,
    user,
    jwtToken,
  });
};
module.exports = sendToken;
