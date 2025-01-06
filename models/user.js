// import
const mongoose=require("mongoose");
const { resetPasword } = require("../controllers/ResetPassword");

// create schema
const userSchema=new mongoose.Schema({
    firstName:{
        type:String,
        trim:true,
        required:true,
    },
    lastName:{
        type:String,
        trim:true,
        required:true,
    },
    email:{
        type:String,
        required:true,
    },
    password:{
        type:String,
        required:true,
    },
    accountType:{
        type:String,
        enum:['Admin','Instructor','Student'],
        required:true
    },
    additionalDetails:{
        type:mongoose.Schema.Types.ObjectId,
        // required:true,
        ref:"Profile",
    },
    courses:[
        {
            type:mongoose.Schema.Types.ObjectId,
            required:true,
            ref:"Course"
        }
    ],
    courseProgress:{
        type:mongoose.Schema.Types.ObjectId,
        // required:true,
        ref:"CourseProgress"
    },
    image:{
        type:String,
        required:true
    },
    token:{
        type:String,
    },
    resetPaswordExpires:{
        type:Date,
    }
});

module.exports=mongoose.model("User",userSchema);