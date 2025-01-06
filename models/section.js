// import mongoose
const mongoose=require('mongoose');

// create schema
const sectionSchema=new mongoose.Schema({
    sectionName:{
        type:String,
    },
    subSection:[{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"SubSection",
    }],
});

// export schema
module.exports=mongoose.model("Section",sectionSchema);