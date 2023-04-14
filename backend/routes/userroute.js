const express = require("express");
const {
  registerUser,
  loginUser,
  logoutUser,
  forgetPassword,
  resetPassword,
  getUserDetails,
  updatePassword,
  updateDetails,
  getALlUsers,
  getSingleUserDetails,
  deleteUser,
  updateRole,
} = require("../controllers/usercontroller");
const { isAuthenticatedUser, authorizeRole } = require("../middleware/auth");

const router = express.Router();

router.route("/register").post(registerUser);

router.route("/login").post(loginUser);

router.route("/logout").get(logoutUser);

router.route("/password/forgot").post(forgetPassword);
router.route("/password/reset/:token").put(resetPassword);
// user details
router.route("/me").get(isAuthenticatedUser, getUserDetails);

router.route("/me/update").put(isAuthenticatedUser, updateDetails);

router.route("/password/update").put(isAuthenticatedUser, updatePassword);

// admin
router
  .route("/admin/users")
  .get(isAuthenticatedUser, authorizeRole("admin"), getALlUsers);
router
  .route("/admin/user/:id")
  .get(isAuthenticatedUser, authorizeRole("admin"), getSingleUserDetails)
  .delete(isAuthenticatedUser, authorizeRole("admin"),deleteUser)
  .put(isAuthenticatedUser, authorizeRole("admin"),updateRole);

module.exports = router;
