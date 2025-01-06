// import mongoose
const mongoose=require('mongoose');

// create schema
const SubSectionSchema=new mongoose.Schema({
    title:{
        type:String,
    },
    timeDuration:{
        type:String,
    },
    description:{
        typr:String,
    },
    videoUrl:{
        type:String,
    }
});

// export mongoose
module.exports=mongoose.model("SubSection",SubSectionSchema);