// import mongoose and other liberary
const mongoose=require('mongoose');

// create a profile schema
const profileSchema=mongoose.Schema({
    gender:{
        type:String,
        // required:true
    },
    dateOfBirth:{
        type:String,
    },
    about:{
        type:String,
        trim:true,
    },
    contactNumber:{
        type:String,
        trim:true,
    }
});

// export schema
module.exports=mongoose.model("Profile",profileSchema);