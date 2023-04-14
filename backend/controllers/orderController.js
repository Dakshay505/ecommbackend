const Order = require("../models/orderModel");
const catchasyncerror = require("../middleware/catchasyncerror");
const ErrorHandler = require("../utils/errorhandler");
const Product = require("../models/productModel");

// new order create 
exports.newOrder = catchasyncerror(async (req, resp, next) => {
  const {
    shippingInfo,
    orderItems,
    paymentInfo,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice
  } = req.body;
  const order = await Order.create({
    shippingInfo,
    orderItems,
    paymentInfo,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    paidAt:Date.now(),
    user:req.user.id
  });
  resp.status(201).json({
    success:true,
    order
  })
});

// get single orders 
exports.getSingleOrder = catchasyncerror ( async (req,resp,next)=>{
  const order = await Order.findById(req.params.id).populate(
    "user",
    "name email"
  );

  if (!order) {
    return next(new ErrorHandler("Order not found with this Id", 404));
  }

  resp.status(200).json({
    success: true,
    order,
  });
});

// get all  orders of user  
exports.getAllOrder = catchasyncerror(async (req,resp,next)=>{
  const orders = await Order.find({user:req.user._id});
  
  resp.status(200).json({
    success:true,
    orders
  })
});

// get all orders -- admin 
exports.getAllOrdersAdmin =catchasyncerror( async (req,resp,next)=>{
  const orders = await Order.find();

  let totalAmount = 0;
  orders.forEach(element => {
    totalAmount+=element.totalPrice;
  });
   
  resp.status(200).json({
    success:true,
    totalAmount,
    orders
  })
}) ;
// update order status -- admin 
exports.updateOrderStatus =catchasyncerror( async (req,resp,next)=>{
  const order = await Order.findById(req.params.id);
  if (!order) {
    return next(new ErrorHandler("Order not found with this Id", 404));
  }
  if(order.orderStatus === "delivered"){
    return next(new ErrorHandler("Product has been delivered .",404));
  }
  order.orderItems.forEach(async (order)=>{
    await updateStock(order.product,order.quantity);
  });
  order.orderStatus=req.body.status;
  if(req.body.status === "delivered"){
    order.deliveredAt = Date.now();
  }

   await order.save({ validateBeforeSave:false});
  resp.status(200).json({
    success:true,
    order
  })
}) ;

//update stock 
async function updateStock(id,quantity){
  const product = await Product.findById(id);
  product.stock-=quantity;
  await product.save({ validateBeforeSave:false});
}

// delete order --admin
exports.deleteOrder =catchasyncerror( async (req,resp,next)=>{
  const order = await Order.findById(req.params.id);
  if (!order) {
    return next(new ErrorHandler("Order not found with this Id", 404));
  }
  await order.remove();

  resp.status(200).json({
    success:true,
  })
});
