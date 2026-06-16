const mongoose=require('mongoose');
const dotenv=require('dotenv');
dotenv.config();
const DBconnection=async()=>{
    try {
        await mongoose.connect(process.env.MONGO_URI);// this database url shouldnt be hardcoded or exposed else anyone can access our database and do whatever they want to it so we will use environment variable to store the database url and we will use dotenv package to load the environment variable from .env file
        console.log('Connected to MongoDB successfully');
    } catch (error) {
        console.error( "Error connecting to MongoDB: " + error.message);
        throw error;
    }
};
module.exports=DBconnection;