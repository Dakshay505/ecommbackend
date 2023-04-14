const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name : {
        type : String,
        required : [true,"Please enter the  name of the product "]
    },
    description:{
        type : String,
        required : [true,"Please enter the description of the product "]
    },
    price:{
        type:Number,
        required : [true,"Please enter the price of the product "],
        maxLength:[7 , "The price cannot exceed 7 digit number"]
    },
    ratings:{
        type:Number,
        default:0
    },
     images:[{
        public_id:{
            type:String,
            required : true
        },
        url:{
            type:String,
            required : true
        }
     }],
     category:{
        type:String,
        required:[true,"enter the category of the  product"]
     },
     stock:{
        type:Number,
        required:true,
        default:1,
        maxLength:[4,"Stocks length must be less than 4 digit number"]
     },
     numOfReviews :{
        type:Number,
        default:0
     },
     reviews: [
      {
        user: {
          type: mongoose.Schema.ObjectId,
          ref: "User",
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        rating: {
          type: Number,
          required: true,
        },
        comment: {
          type: String,
          required: true,
        },
      },
    ],  
     user:{
        type : mongoose.Schema.ObjectId,
        ref : "User",
        required :true
     },
     createdAt : {
        type:Date,
        default:Date.now
     }
})
module.exports = mongoose.model("product",productSchema);
