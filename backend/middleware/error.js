const errorHandler = require('../utils/errorhandler');

module.exports =(err , req , resp , next)=>{
    err.statusCode = err.statusCode || 500;
    err.message= err.message || "Internal server error";

    // Cast error Handling 
    if(err.name === "CastError"){
        let message = `resourse not found . Invalid : ${err.path}`;
        err = new errorHandler(message,400);
    }

    // Duplicate key error
    if(err.name === 11000){
        let message = `Duplicate ${Object.keys(err.keyValue)} entered .`;
        err = new errorHandler(message,400);
    }
    // json web token error 
    if(err.name === "JsonWebTokenError"){
        let message = `Json web token is invalid try again .`;
        err = new errorHandler(message,400);
    }
    // json web token error 
    if(err.name === "TokenExpiredError"){
        let message = `Json web token is Expired .`;
        err = new errorHandler(message,400);
    }

    
    resp.status(err.statusCode).json({
        success : false ,
        error : err.stack,
        message : err.message
    })
}