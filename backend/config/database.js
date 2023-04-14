const mongoose =require('mongoose');

let connectDatabase = ()=>{
    mongoose.connect(process.env.DB_URL).then((data)=>{
        console.log(`database connected properly ${data.connection.host}`)
   });
}
module.exports = connectDatabase;