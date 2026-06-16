const mongoose=require('mongoose');
const authUserSchema=new mongoose.Schema({
    firstName:{
        type:String,
        required:true,
    },
    lastName:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    password:{
        type:String,
        required:true, 
    },
});
const AuthUser=mongoose.model('AuthUser',authUserSchema);
module.exports=AuthUser;