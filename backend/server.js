const app = require('./app');
const dotenv = require('dotenv');
const connectDatabase = require('./config/database');
const cloudinary = require('cloudinary');
// UncaughtError resolve
process.on("uncaughtException" , (err)=>{
    console.log(`error: ${err.message}`);
    console.log("The server is shutting down becouse of UncaughtError");
    process.exit(1);  
})

//config

dotenv.config({path:"backend/config/config.env"});

//connecting database
connectDatabase();

cloudinary.config({
    cloud_name:process.env.CLOUDINARY_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET
})


const server = app.listen(parseInt(process.env.PORT),()=>{
    console.log(`Server is working on http://localhost:${process.env.PORT}`);
})

// UnHandled promise rejection 
// for these type of error we have to shut down the server asap
process.on("unhandledRejection",(err)=>{
    console.log(`Error : ${err.message}`);
    console.log("server is being close due to UnHandled promise rejection");

    server.close(()=>{
        process.exit(1);
    })
})