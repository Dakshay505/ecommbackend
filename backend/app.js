const express = require('express');
const app = express();
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');

// adding middleware for error
const errorMiddleware = require('./middleware/error');

app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended:true}));
app.use(fileUpload())

// adding routers
const product = require('./routes/productroute');
const user = require("./routes/userroute");
const order = require("./routes/orderroute");
const payment = require("./routes/paymentRoute");


app.use("/api/v1",user)
app.use("/api/v1",product);
app.use("/api/v1",order);
app.use("/api/v1",payment);


app.use(errorMiddleware);
module.exports = app;