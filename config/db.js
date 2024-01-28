const mongoose = require('mongoose');

const connectDB = async () =>{
    try{
        const conn = await mongoose.connect(process.env.MONGO_URI,{
            //Optional Configurations
        })
        console.log('Connected to Mongo')
    }catch(err){
    console.error(err);
    process.exit(1)
    }
   
}
module.exports = connectDB