const express = require("express");
const {
  getAllProduct,
  createProduct,
  updateProduct,
  delleteProduct,
  getProduct,getAdminProducts,
  createPorductReviewsAndUpdate,
  getProductReviews,
  deleteReviews,} = require("../controllers/productcontroller");
const { isAuthenticatedUser, authorizeRole } = require("../middleware/auth");
const router = express.Router();

router.route("/products").get(getAllProduct);
router
  .route("/admin/products")
  .get(isAuthenticatedUser, authorizeRole("admin"), getAdminProducts);

router
  .route("/admin/product/new")
  .post(isAuthenticatedUser, authorizeRole("admin"), createProduct);
router
  .route("/admin/product/:id")
  .put(isAuthenticatedUser, authorizeRole("admin"), updateProduct)
  .delete(isAuthenticatedUser, authorizeRole("admin"), delleteProduct);
router.route("/product/:id").get(getProduct);


// reviews  
router.route("/review").put(isAuthenticatedUser,createPorductReviewsAndUpdate);
router.route("/reviews").get(getProductReviews).delete(isAuthenticatedUser,deleteReviews);
module.exports = router;
