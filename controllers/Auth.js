const User=require("../models/user");
const OTP=require("../models/OTP");
const otpGenerator=require("otp-generator");
const bcrypt=require("bcrypt");
const jwt=require("jsonwebtoken");
const Profile=require("../models/profile");
const mailSender = require("../utils/mailSender");
const { passwordUpdated } = require("../mail/passwordUpdate");
require("dotenv").config();

// sent otp
exports.sendOTP = async (req,res)=> {
    try{
        // fetch email from req body
        const {email}=req.body;

        // check user already exists or not
        const checkUserParsent=await User.findOne({email});
        if(checkUserParsent){
            return res.status(401).json({
                success: false,
                message: 'User already registered'
            });
        }

        // if not genrate otp
        var otp=otpGenerator.generate(6,{
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false,
        });
        console.log('otp genrated', otp);

        // check otp is unique or not
        const result=await OTP.findOne({otp});
        while(result){
            otp=otpGenerator.generate(6,{
                upperCaseAlphabets: false,
                lowerCaseAlphabets: false,
                specialChars: false,
            });
            result=await OTP.findOne({otp});
        }

        // store otp in db for matching
        const otpPayload={email,otp};
        const otpBody=await OTP.create(otpPayload);
        console.log(otpBody);

        // return response
        res.status(200).json({
            success:true,
            message:'otp sent successfully',
        });
    }
    catch(error){
        console.log(error);
        res.status(500).json({
            success:false,
            message:error.message,
        })

    }
};

// signup
exports.signUp = async (req,res) => {
    try{
        // data fetch from request body
        const {firstName,lastName,email,password,confirmPassword,accountType,otp}=req.body;

        // validation
        if(!firstName||!lastName||!email||!password||!confirmPassword||!otp){
            return res.status(403).json({
                success:false,
                message:'All fields are require',
            });
        }

        // match both password
        if(password!==confirmPassword){
            return res.status(400).json({
                success:false,
                message:'password and confirmpassword not match',
            });
        }

        // check user already exist or not
        const existingUser=await User.findOne({email});
        if(existingUser){
            return res.status(400).json({
                success:false,
                message:'User already exist',
            });
        }

        // find most recent otp stored for the user
        const recentOtp=await OTP.find({email}).sort({createdAt:-1}).limit(1);
        console.log(recentOtp);

        // validate otp
        if(recentOtp.length===0){
            return res.status(400).json({
                success:false,
                message:'otp not found',
            });
        }else if(otp !==recentOtp[0].otp){
            return res.status(400).json({
                success:false,
                message:'invalid otp',
            });
        }

        // hash password
        const hashPassword=await bcrypt.hash(password,10);

        // create entry in db
        const profileDetails=await Profile.create({
            gender:null,
            dateOfBirth:null,
            about:null,
            contactNumber:null,
        });

        const user=await User.create({
            firstName,
            lastName,
            email,
            password:hashPassword,
            accountType,
            additionalDetails:profileDetails._id,
            image:`https://api.dicebar.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
        });

        // return res
        return res.status(200).json({
            success:true,
            message:'User registerd successfully',
            user,
        });
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:'user cannot be registerd. Please try again',
        });
    }  
};

// login
exports.login=async (req,res)=>{
    try{
        // fetch data from req body
        const {email,password}=req.body;

        // validation of data
        if(!email||!password){
            return res.status(403).json({
                success:false,
                message:'All fields are require please try again',
            });
        }

        // check user exist or not
        const user=await User.findOne({email}).populate("additionalDetails");
        if(!user){
            return res.status(401).json({
                success:false,
                message:'User not registerd. Please signup first',
            });
        }

        // generate jwt after password matching
        if(await bcrypt.compare(password,user.password)){
            const token=jwt.sign({ email:user.email, id:user._id, accountType:user.accountType} ,process.env.JWT_SECRET,{
                expiresIn:"2h",
            });
            user.token=token;
            user.password=undefined;

            // create cookie and response
            const options={
                expires:new Date(Date.now()+3*24*60*60*1000),
                httpOnly:true,
            }
            res.cookie("token",token,options).status(200).json({
                success:true,
                token,
                user,
                message:'Logged in successfully',
            });
        }
        else{
            return res.status(401).json({
                success:false,
                message:'password is incorrect'
            });
        }
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:'login failure,please try again',
        });
    }
};

// change password
exports.changePassword = async (req, res) => {
    try {
        // get user data from req body
        const userDetails = await User.findById(req.user.id);
    
        // Get old password, new password, and confirm new password from req.body
        const { oldPassword, newPassword, confirmNewPassword } = req.body;

        // Validate old password
        const isPasswordMatch = await bcrypt.compare(
          oldPassword,
          userDetails?.password
        );
    
        if (!isPasswordMatch) {
          // If old password does not match, return a 401 (Unauthorized) error
          return res
            .status(401)
            .json({ success: false, message: "The password is incorrect" });
        }
    
        // Match new password and confirm new password
        if (newPassword !== confirmNewPassword) {
          // If new password and confirm new password do not match, return a 400 (Bad Request) error
          return res.status(400).json({
            success: false,
            message: "The password and confirm password does not match",
          });
        }
    
        // Update Password
        const encryptedPassword = await bcrypt.hash(newPassword, 10);
        const updatedUserDetails = await User.findByIdAndUpdate(
          req.user.id,
          { password: encryptedPassword },
          { new: true }
        );
    
        // Send notification email
        try {
          const emailResponse = await mailSender(
            updatedUserDetails.email,
            passwordUpdated(
              updatedUserDetails.email,
              `Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
            )
          );
          console.log("Email sent successfully:", emailResponse?.response);
        } catch (error) {
          // If there's an error sending the email, log the error and return a 500 (Internal Server Error) error
          console.error("Error occurred while sending email:", error);
          return res.status(500).json({
            success: false,
            message: "Error occurred while sending email",
            error: error.message,
          });
        }
        // Return success response
        return res
          .status(200)
          .json({ success: true, message: "Password updated successfully" });
      } catch (error) {
        // If there's an error updating the password, log the error and return a 500 (Internal Server Error) error
        console.error("Error occurred while updating password:", error);
        return res.status(500).json({
          success: false,
          message: "Error occurred while updating password",
          error: error.message,
        });
    }
}