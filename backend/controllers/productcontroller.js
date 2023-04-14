const catchasyncerror = require("../middleware/catchasyncerror");
const Product = require("../models/productModel");
const ErrorHandler = require("../utils/errorhandler");
const ApiFeatures = require("../utils/apifeatures");
const cloudinary = require('cloudinary');

// create a new product - admin

exports.createProduct = catchasyncerror(async (req, resp, next) => {
  let images = [];
  if(typeof req.body.images === "string"){
    images.push(req.body.images);
  }else{
    images = req.body.images;
  }
  let imagesLink = [];
  for (let i = 0; i < images.length; i++) {
    const result = await cloudinary.v2.uploader.upload(images[i],{
      folder:"products"
    })
    imagesLink.push({
      public_id:result.public_id,
      url:result.secure_url
    })
  }
  req.body.images = imagesLink;
  req.body.user = req.user.id;
  const product = await Product.create(req.body);
  resp.status(201).json({
    message: "The new product has been added",
    success: true,
    product,
  });
});

// Update product

exports.updateProduct = catchasyncerror(async (req, resp, next) => {
  let product = await Product.findById(req.params.id);
  if (!product) {
    return next(new ErrorHandler(404, "Product Not found"));
  }
  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });
  resp.status(200).json({
    success: true,
    message: "product updated",
    product,
  });
});

// get single product
exports.getProduct = catchasyncerror(async (req, resp, next) => {
  let product = await Product.findById(req.params.id);
  if (!product) {
    return next(new ErrorHandler(404, "Product Not found"));
  }
  resp.status(200).json({
    success: true,
    product,
  });
});
// dellete Product
exports.delleteProduct = catchasyncerror(async (req, resp, next) => {

  let product = await Product.findById(req.params.id);
  if (!product) {
    return next(new ErrorHandler(404, "Product Not found"));
  }
  // delleting images from cloudinary 
  for (let i = 0; i < product.length; i++) {
    await cloudinary.v2.uploader.destroy(product.images[i].public_id)
    
  }
  product = await Product.findByIdAndDelete(req.params.id);
  resp.status(200).json({
    success: true,
    message: "product delleted ",
    product,
  });
});

// admin product
exports.getAdminProducts = catchasyncerror(async (req, res, next) => {
  const products = await Product.find();

  res.status(200).json({
    success: true,
    products,
  });
});

// get all product

exports.getAllProduct = catchasyncerror(async (req, resp, next) => {
  // Number of prooduct on page to show
  // so we can create a varibale for number of the product to show on the page
  const resultPerPage = 8;
  const productsCount = await Product.countDocuments();
  const apiFeature = new ApiFeatures(Product.find(), req.query)
    .search()
    .filter();
    let products = await apiFeature.query;

    let filteredProductsCount = products.length;

    apiFeature.pagination(resultPerPage);

    products = await apiFeature.query.clone();
    resp.status(200).json({
      success: true,
      products,
      productsCount,
      resultPerPage,
      filteredProductsCount,
    });
});

// Create New review or update reviews
exports.createPorductReviewsAndUpdate = catchasyncerror(
  async (req, resp, next) => {
    const { rating, comment, productId } = req.body;

    const review = {
      user: req.user.id,
      name: req.user.name,
      rating: Number(rating),
      comment,
    };

    const product = await Product.findById(productId);
    const isReviewed = product.reviews.find(
      (rev) => rev.user.toString() === req.user.id.toString()
    );

    if (isReviewed) {
      product.reviews.forEach((rev) => {
        if (rev.user.toString() === req.user.id.toString())
          (rev.rating = rating), (rev.comment = comment);
      });
    } else {
      product.reviews.push(review);
      product.numOfReviews = product.reviews.length;
    }
    let avg = 0;
    product.reviews.forEach((rev) => {
      avg = avg + rev.rating;
    }) / product.reviews.length;
    console.log(rating);
    product.ratings = avg / product.reviews.length;

    console.log(product.ratings);
    await product.save({ validateBeforeSave: false });
    resp.status(200).json({
      success: true,
      message: "review added successfully .",
    });
  }
);
// Get reviews
exports.getProductReviews = catchasyncerror(async (req, resp, next) => {
  const product = await Product.findById(req.query.id);
  if (!product) {
    return next(new ErrorHandler("Product not found .", 404));
  }
  resp.status(200).json({
    success: true,
    productReviews: product.reviews,
  });
});
// Dellete reviews
exports.deleteReviews = catchasyncerror(async (req, resp, next) => {
  const product = await Product.findById(req.query.productId);
  if (!product) {
    return next(new ErrorHandler("Product not found .", 404));
  }

  const reviews = await Product.findById(req.query.productId).reviews.filter(
    (rev) => rev.user.toString() !== req.query.id.toString()
  );
  const numberOfReviews = reviews.length;
  let avg = 0;
  reviews.forEach((rev) => {
    avg = avg + rev.rating;
  }) / reviews.length;

  product.ratings = avg / reviews.length;
  await Product.findByIdAndUpdate(
    {
      reviews,
      ratings,
      numberOfReviews,
    },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );

  resp.status(200).json({
    success: true,
    message: "Review delleted successfully .",
  });
});
