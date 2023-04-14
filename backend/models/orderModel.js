const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  shippingInfo: {
    address: {
      required: true,
      type: String,
    },
    state: {
      required: true,
      type: String,
    },
    city: {
      required: true,
      type: String,
    },
    pinCode: {
      required: true,
      type: Number,
      maxLength: [
        6,
        "Maximum and minimum length of the pincode should be less than 6 .",
      ],
    },
    phoneNo: {
      required: true,
      type: Number,
      maxLength: [
        10,
        "Maximum and minimum length of the phoneNumber should be less than 6 .",
      ],
    },
  },
  orderItems: [
    {
      name: {
        required: true,
        type: String,
      },
      quantity: {
        required: true,
        type: Number,
      },
      price: {
        required: true,
        type: Number,
      },
      image: {
        required: true,
        type: String,
      },
      product: {
        required: true,
        type: mongoose.Schema.ObjectId,
        ref: "Product",
      },
    },
  ],
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "user",
    required: true,
  },
  paymentInfo: {
    id: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
  },
  paidAt: {
    type: Date,
    required: true,
  },
  itemsPrice: {
    type: Number,
    required: true,
    default: 0,
  },
  taxPrice: {
    type: Number,
    required: true,
    default: 0,
  },
  shippingPrice: {
    type: Number,
    required: true,
    default: 0,
  },
  totalPrice: {
    type: Number,
    required: true,
    default: 0,
  },
  orderStatus: {
    type: String,
    required: true,
    default: "Processing",
  },
  deliveredAt: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Order", orderSchema);
