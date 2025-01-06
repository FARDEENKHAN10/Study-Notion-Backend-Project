const User=require("../models/user");
const Profile=require("../models/profile");

// updateprofile handler
exports.updateProfile=async (req,res)=>{
    try{
        // get data 
        const{about="",dateOfBirth="",contactNumber,gender}=req.body;
        const id=req.user.id;

        // validation
        if(!contactNumber||!id){
            return res.status(401).json({
                success:false,
                message:'All fields are required',
            });
        }

        // find profile
        const userDetails=await User.findById(id);
        const profileId=userDetails.additionalDetails;
        const profileDetails=await Profile.findById(profileId)

        // update profile
        profileDetails.gender=gender;
        profileDetails.about=about;
        profileDetails.contactNumber=contactNumber;
        profileDetails.dateOfBirth=dateOfBirth;
        await profileDetails.save();

        // return respose
        return res.status(200).json({
            success:true,
            message:"Profile updated successfully",
            profileDetails,
        });
    }catch(error){
        return res.status(500).json({
            success:false,
            error:error.message,
        });
    }
}

// deleteaccount
exports.deleteAccount=async (req,res)=>{
    try{
        // get id
        const id=req.user?.id;

        // verify user
        const userDetails=await User.findById(id);
        if(!userDetails){
            return res.status(400).json({
                succcess:false,
                message:'User not exist',
            });
        }

        // delete profile and user
        await Profile.findByIdAndDelete({_id:userDetails.additionalDetails});
        await User.findByIdAndDelete({_id:id});

        // return res
        return res.status(200).json({
            success:true,
            message:'user delete successfully',
        });
    }catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:'user cannot delete',
            error:error.message,
        });
    }
}

// getalluserdetails handler
exports.getAllUserDetails=async (req,res)=>{
    try{
        // get id
        const id=req.user.id;

        const userDetails=await User.findById(id).populate('additionalDetails').exec();

        return res.status(200).json({
            success:true,
            message:'All details are fetch',
            userDetails,
        });
    }catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:'user cannot delete',
        });
    }
}